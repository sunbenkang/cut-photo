from fastapi import APIRouter, Query, HTTPException

from app.config import settings
from app.services.movie_service import search_movies, get_movie_detail

router = APIRouter(prefix="/api/movies", tags=["movies"])


@router.get("/search")
async def search(q: str = Query(..., description="搜索关键词"), page: int = 1, limit: int = 10):
    if not q.strip():
        return {"results": [], "total": 0}

    result = await search_movies(q.strip(), api_key=settings.tmdb_api_key, page=page, limit=limit)

    if not result["results"]:
        return {
            "results": [],
            "total": 0,
            "message": "未找到相关影片，请尝试更换关键词或使用更准确的电影名称",
        }

    return result


@router.get("/{movie_id}")
async def detail(movie_id: str):
    if not movie_id.strip():
        raise HTTPException(status_code=400, detail="请提供影片ID")

    result = await get_movie_detail(movie_id.strip(), api_key=settings.tmdb_api_key)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail={"error": {"code": "MOVIE_NOT_FOUND", "message": "未找到影片信息，您可以跳过角色匹配继续生成"}},
        )

    if not result.get("characters"):
        return {**result, "message": "该影片暂无角色信息，您可以跳过角色选择"}

    return result
