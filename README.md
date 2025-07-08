# 追番网站

一个使用 FastAPI + Vue.js + Tailwind CSS 构建的追番管理网站。

## 功能特性

### 前端页面
- 📺 追番列表展示
- 🔍 搜索和筛选功能
- 📊 观看进度可视化
- 🎨 现代化UI设计
- 📅 按更新日查看
- 🌟 今日更新提醒

### 后台管理
- ➕ 添加新动漫
- ✏️ 编辑动漫信息
- 🗑️ 删除动漫记录
- 📝 备注功能
- 🔗 平台链接地址

## 技术栈

- **后端**: FastAPI (Python)
- **前端**: Vue.js 3 + Tailwind CSS
- **数据库**: SQLite
- **API**: RESTful API

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 启动后端服务器

```bash
# 方法1: 使用启动脚本
python start_backend.py

# 方法2: 直接运行
cd backend
python main.py
```

### 3. 访问应用

- **前端页面**: http://localhost:8000/frontend/index.html
- **API文档**: http://localhost:8000/docs
- **后台管理**: 在前端页面点击"管理后台"按钮

## 项目结构

```
zhuifan/
├── backend/
│   ├── main.py              # FastAPI后端应用
│   └── anime.db             # SQLite数据库文件
├── frontend/
│   ├── index.html           # 前端页面
│   └── app.js              # Vue.js应用逻辑
├── requirements.txt         # Python依赖
├── start_backend.py        # 后端启动脚本
└── README.md              # 项目说明
```

## API接口说明

### 1. 获取动漫列表
```http
GET /api/animes
```

**响应示例:**
```json
[
  {
    "id": 1,
    "title": "动漫名称",
    "current_episode": 5,
    "total_episodes": 12,
    "platform": "哔哩哔哩",
    "platform_url": "https://www.bilibili.com/bangumi/play/ss12345",
    "status": "追番中",
    "notes": "很好看的一部动漫",
    "update_day": "周二",
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T10:30:00"
  }
]
```

### 2. 添加新动漫
```http
POST /api/animes
Content-Type: application/json
```

**请求体:**
```json
{
  "title": "动漫名称",
  "current_episode": 1,
  "total_episodes": 12,
  "platform": "哔哩哔哩",
  "platform_url": "https://www.bilibili.com/bangumi/play/ss12345",
  "status": "追番中",
  "notes": "备注信息",
  "update_day": "周二"
}
```

**字段说明:**
- `title` (必填): 动漫名称
- `current_episode` (必填): 当前观看集数
- `total_episodes` (可选): 总集数
- `platform` (必填): 播放平台
- `platform_url` (可选): 平台链接地址
- `status` (可选): 状态，默认为"追番中"
- `notes` (可选): 备注信息
- `update_day` (可选): 更新日期（周一/周二/周三/周四/周五/周六/周日）

### 3. 更新动漫信息
```http
PUT /api/animes/{anime_id}
Content-Type: application/json
```

**请求体:** 与添加新动漫相同

### 4. 删除动漫
```http
DELETE /api/animes/{anime_id}
```

**响应:**
```json
{
  "message": "删除成功"
}
```

### 5. 获取今日更新
```http
GET /api/animes/today
```

**响应示例:**
```json
{
  "today": "周二",
  "animes": [
    {
      "id": 1,
      "title": "动漫名称",
      "current_episode": 5,
      "total_episodes": 12,
      "platform": "哔哩哔哩",
      "platform_url": "https://www.bilibili.com/bangumi/play/ss12345",
      "status": "追番中",
      "notes": "很好看的一部动漫",
      "update_day": "周二",
      "created_at": "2024-01-15T10:30:00",
      "updated_at": "2024-01-15T10:30:00"
    }
  ]
}
```

### 6. 获取前端页面
```http
GET /frontend
```

返回前端HTML页面

### 7. 获取API根路径
```http
GET /
```

**响应:**
```json
{
  "message": "追番网站API"
}
```

## 数据模型

```python
class Anime:
    id: int                    # 唯一标识
    title: str                 # 动漫名称
    current_episode: int       # 当前观看集数
    total_episodes: int        # 总集数（可选）
    platform: str              # 播放平台
    platform_url: str          # 平台链接地址（可选）
    status: str                # 状态（追番中/已完结/暂停）
    notes: str                 # 备注信息（可选）
    update_day: str            # 更新日期（可选）
    created_at: str            # 创建时间
    updated_at: str            # 更新时间
```

## 支持的播放平台

- 腾讯视频
- 爱奇艺
- 哔哩哔哩
- 优酷
- 百度云盘
- 阿里云盘
- AGE动漫
- 其他（自定义）

## 状态说明

- **追番中**: 正在追看的动漫
- **已完结**: 已经完结的动漫
- **暂停**: 暂时停止追看的动漫

## 开发说明

### 添加新功能
1. 在 `backend/main.py` 中添加新的API路由
2. 在 `frontend/app.js` 中添加对应的前端逻辑
3. 在 `frontend/index.html` 中添加UI组件

### 自定义样式
项目使用 Tailwind CSS，可以直接在HTML中使用Tailwind类名进行样式定制。

### 数据库迁移
系统会自动检测并添加新字段，无需手动迁移数据库。

## 许可证

MIT License 