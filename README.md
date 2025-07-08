# 追番网站

一个使用 FastAPI + Vue.js + Tailwind CSS 构建的追番管理网站。

## 功能特性

### 前端页面
- 📺 追番列表展示
- 🔍 搜索和筛选功能
- 📊 观看进度可视化
- 🎨 现代化UI设计

### 后台管理
- ➕ 添加新动漫
- ✏️ 编辑动漫信息
- 🗑️ 删除动漫记录
- 📝 备注功能

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
│   └── main.py              # FastAPI后端应用
├── frontend/
│   ├── index.html           # 前端页面
│   └── app.js              # Vue.js应用逻辑
├── requirements.txt         # Python依赖
├── start_backend.py        # 后端启动脚本
└── README.md              # 项目说明
```

## API接口

### 获取动漫列表
```
GET /api/animes
```

### 添加新动漫
```
POST /api/animes
Content-Type: application/json

{
    "title": "动漫名称",
    "current_episode": 1,
    "total_episodes": 12,
    "platform": "播放平台",
    "status": "追番中",
    "notes": "备注信息"
}
```

### 更新动漫信息
```
PUT /api/animes/{anime_id}
```

### 删除动漫
```
DELETE /api/animes/{anime_id}
```

## 数据模型

```python
class Anime:
    id: int                    # 唯一标识
    title: str                 # 动漫名称
    current_episode: int       # 当前观看集数
    total_episodes: int        # 总集数（可选）
    platform: str              # 播放平台
    status: str                # 状态（追番中/已完结/暂停）
    notes: str                 # 备注信息
    created_at: str            # 创建时间
    updated_at: str            # 更新时间
```

## 开发说明

### 添加新功能
1. 在 `backend/main.py` 中添加新的API路由
2. 在 `frontend/app.js` 中添加对应的前端逻辑
3. 在 `frontend/index.html` 中添加UI组件

### 自定义样式
项目使用 Tailwind CSS，可以直接在HTML中使用Tailwind类名进行样式定制。

## 许可证

MIT License 