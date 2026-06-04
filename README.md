# Cut Photo - AI 电影片场合影生成器 🎬

基于 **Qwen-Image 2.0**（DashScope/阿里云百炼）的 AI 电影片场合影生成器。上传你的照片，选择你喜欢的电影/剧集场景，AI 将你融入经典影视时刻。

## ✨ 功能

- 📸 **照片上传与处理** — 支持拖拽上传，MediaPipe 智能人脸检测与裁剪
- 🎥 **影视搜索** — 接入 TMDB API，搜索海量电影和剧集
- 🤖 **AI 合影生成** — 基于 Qwen-Image 2.0，将你的脸融入电影场景
- 🖼️ **作品管理** — 查看、下载、管理你的生成历史
- 🎨 **模板系统** — 内置电影风格模板，一键生成

## 🛠️ 技术栈

### 前端
- [Next.js 16](https://nextjs.org/) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- [MediaPipe](https://mediapipe.dev/)（人脸检测）
- Zustand（状态管理）、React Query（数据请求）、Framer Motion（动画）

### 后端
- [FastAPI](https://fastapi.tiangolo.com/)（Python 3）
- SQLAlchemy + SQLite / PostgreSQL
- Pillow + MediaPipe（图像处理）
- 阿里云 DashScope（Qwen-Image 2.0 图像生成）

## 🚀 快速开始

### 环境要求

- [Docker](https://www.docker.com/) & Docker Compose（推荐）
- 或：Python 3.10+ / Node.js 20+

### Docker 部署（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/sunbenkang/cut-photo.git
cd cut-photo

# 2. 配置环境变量
cp backend/.env.example backend/.env
# 编辑 backend/.env，填入 TMDB_API_KEY（从 https://www.themoviedb.org/settings/api 获取）

# 3. 启动
docker compose up -d

# 4. 访问
# 前端：http://localhost:3000
# 后端 API：http://localhost:8000
# API 文档：http://localhost:8000/docs
```

### 本地开发

**后端：**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # 编辑 .env 填写配置

uvicorn app.main:app --reload --port 8000
```

**前端：**

```bash
cd frontend
npm install
npm run dev  # http://localhost:3000
```

## 📁 项目结构

```
cut-photo/
├── backend/
│   ├── app/
│   │   ├── api/          # API 路由（auth、upload、movies、generate、works、templates）
│   │   ├── models/       # 数据模型（SQLAlchemy）和 Pydantic schemas
│   │   ├── services/     # 业务逻辑（生成管道、图片处理、TMDB 搜索等）
│   │   ├── middleware/   # 认证中间件
│   │   ├── utils/        # 工具函数
│   │   ├── config.py     # 配置管理
│   │   └── main.py       # FastAPI 入口
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js App Router 页面
│   │   ├── components/   # React 组件
│   │   ├── hooks/        # 自定义 Hooks
│   │   ├── lib/          # 工具库
│   │   ├── stores/       # Zustand 状态管理
│   │   └── types/        # TypeScript 类型定义
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml
```

## 🔧 环境变量

### 后端 (`backend/.env`)

| 变量 | 说明 | 必填 |
|------|------|------|
| `SECRET_KEY` | FastAPI 密钥 | 是 |
| `TMDB_API_KEY` | TMDB 电影搜索 API Key | 是 |
| `CORS_ORIGINS` | CORS 允许的来源 | 否（默认 localhost:3000） |

### 用户配置

用户在使用时需要提供自己的 **DashScope API Key**（阿里云百炼），用于调用 Qwen-Image 2.0 进行 AI 图像生成。

## 📄 API 概览

| 路径 | 说明 |
|------|------|
| `POST /api/auth` | 用户认证 |
| `POST /api/upload` | 上传照片 |
| `GET /api/movies` | 搜索电影 |
| `POST /api/generate` | AI 生成合影 |
| `GET /api/works` | 作品列表 |
| `GET /api/templates` | 模板列表 |
| `GET /api/health` | 健康检查 |

完整文档：启动后访问 `http://localhost:8000/docs`

## 📝 License

MIT
