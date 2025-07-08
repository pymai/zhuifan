from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
from datetime import datetime
import os

app = FastAPI(title="追番网站API", version="1.0.0")

# 允许跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据模型
class AnimeBase(BaseModel):
    title: str
    current_episode: int
    total_episodes: Optional[int] = None
    platform: str
    platform_url: Optional[str] = None  # 平台链接地址
    status: str = "追番中"  # 追番中, 已完结, 暂停
    notes: Optional[str] = None
    update_day: Optional[str] = None  # 更新日期：周一, 周二, 周三, 周四, 周五, 周六, 周日

class AnimeCreate(AnimeBase):
    pass

class Anime(AnimeBase):
    id: int
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True

# 数据库初始化

def init_db():
    conn = sqlite3.connect('anime.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS animes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            current_episode INTEGER NOT NULL,
            total_episodes INTEGER,
            platform TEXT NOT NULL,
            platform_url TEXT,
            status TEXT DEFAULT '追番中',
            notes TEXT,
            update_day TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# 检查并添加 platform_url 字段（如果不存在）
def add_platform_url_column():
    conn = sqlite3.connect('anime.db')
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE animes ADD COLUMN platform_url TEXT")
        print("已添加 platform_url 字段到数据库")
    except sqlite3.OperationalError:
        # 已存在则忽略
        print("platform_url 字段已存在")
    conn.commit()
    conn.close()

add_platform_url_column()

# 挂载静态文件
if os.path.exists("../frontend"):
    app.mount("/frontend", StaticFiles(directory="../frontend"), name="frontend")

# API路由
@app.get("/")
def read_root():
    return {"message": "追番网站API"}

@app.get("/frontend")
def serve_frontend():
    """提供前端页面"""
    return FileResponse("../frontend/index.html")

@app.get("/api/animes", response_model=List[Anime])
def get_animes():
    conn = sqlite3.connect('anime.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM animes ORDER BY updated_at DESC')
    rows = cursor.fetchall()
    conn.close()
    animes = []
    for row in rows:
        # 兼容旧数据库结构（没有platform_url字段）
        if len(row) >= 11:  # 新版本，包含platform_url
            anime = {
                "id": row[0],
                "title": row[1],
                "current_episode": row[2],
                "total_episodes": row[3],
                "platform": row[4],
                "platform_url": row[5] if row[5] is not None else "",
                "status": row[6],
                "notes": row[7] if row[7] is not None else "",
                "update_day": row[8] if row[8] is not None else "",
                "created_at": row[9] if row[9] is not None else "",
                "updated_at": row[10] if row[10] is not None else ""
            }
        else:  # 旧版本，不包含platform_url
            anime = {
                "id": row[0],
                "title": row[1],
                "current_episode": row[2],
                "total_episodes": row[3],
                "platform": row[4],
                "platform_url": "",
                "status": row[5],
                "notes": row[6] if row[6] is not None else "",
                "update_day": row[7] if row[7] is not None else "",
                "created_at": row[8] if row[8] is not None else "",
                "updated_at": row[9] if row[9] is not None else ""
            }
        animes.append(anime)
    return animes

@app.post("/api/animes", response_model=Anime)
def create_anime(anime: AnimeCreate):
    conn = sqlite3.connect('anime.db')
    cursor = conn.cursor()
    now = datetime.now().replace(microsecond=0).isoformat()
    cursor.execute('''
        INSERT INTO animes (title, current_episode, total_episodes, platform, platform_url, status, notes, update_day, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (anime.title, anime.current_episode, anime.total_episodes, anime.platform, anime.platform_url, anime.status, anime.notes, anime.update_day, now, now))
    anime_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {
        "id": anime_id,
        "title": anime.title,
        "current_episode": anime.current_episode,
        "total_episodes": anime.total_episodes,
        "platform": anime.platform,
        "platform_url": anime.platform_url,
        "status": anime.status,
        "notes": anime.notes,
        "update_day": anime.update_day,
        "created_at": now,
        "updated_at": now
    }

@app.put("/api/animes/{anime_id}", response_model=Anime)
def update_anime(anime_id: int, anime: AnimeCreate):
    conn = sqlite3.connect('anime.db')
    cursor = conn.cursor()
    now = datetime.now().replace(microsecond=0).isoformat()
    cursor.execute('''
        UPDATE animes 
        SET title=?, current_episode=?, total_episodes=?, platform=?, platform_url=?, status=?, notes=?, update_day=?, updated_at=?
        WHERE id=?
    ''', (anime.title, anime.current_episode, anime.total_episodes, anime.platform, anime.platform_url, anime.status, anime.notes, anime.update_day, now, anime_id))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="动漫未找到")
    conn.commit()
    conn.close()
    return {
        "id": anime_id,
        "title": anime.title,
        "current_episode": anime.current_episode,
        "total_episodes": anime.total_episodes,
        "platform": anime.platform,
        "platform_url": anime.platform_url,
        "status": anime.status,
        "notes": anime.notes,
        "update_day": anime.update_day,
        "created_at": "",  # 可选：可从数据库重新获取
        "updated_at": now
    }

@app.get("/api/animes/today")
def get_today_updates():
    """获取今天更新的动漫"""
    import calendar
    
    # 获取今天是星期几
    today = datetime.now()
    weekday = calendar.day_name[today.weekday()]
    
    # 中文星期映射
    weekday_map = {
        'Monday': '周一',
        'Tuesday': '周二', 
        'Wednesday': '周三',
        'Thursday': '周四',
        'Friday': '周五',
        'Saturday': '周六',
        'Sunday': '周日'
    }
    
    today_chinese = weekday_map.get(weekday, weekday)
    
    conn = sqlite3.connect('anime.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM animes WHERE update_day = ? AND status = "追番中" ORDER BY title', (today_chinese,))
    rows = cursor.fetchall()
    conn.close()
    
    animes = []
    for row in rows:
        anime = {
            "id": row[0],
            "title": row[1],
            "current_episode": row[2],
            "total_episodes": row[3],
            "platform": row[4],
            "platform_url": row[5] if len(row) > 5 else "",
            "status": row[6] if len(row) > 6 else row[5],
            "notes": row[7] if len(row) > 7 else row[6],
            "update_day": row[8] if len(row) > 8 else row[7],
            "created_at": row[9] if len(row) > 9 else row[8],
            "updated_at": row[10] if len(row) > 10 else row[9]
        }
        animes.append(anime)
    
    return {
        "today": today_chinese,
        "animes": animes
    }

@app.delete("/api/animes/{anime_id}")
def delete_anime(anime_id: int):
    conn = sqlite3.connect('anime.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM animes WHERE id=?', (anime_id,))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="动漫未找到")
    conn.commit()
    conn.close()
    return {"message": "删除成功"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 