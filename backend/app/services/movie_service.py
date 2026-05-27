import asyncio
import json
import hashlib
from datetime import datetime

import httpx


TMDB_BASE = "https://api.themoviedb.org/3"
CACHE_TTL_HOURS = 24


async def search_movies(query: str, api_key: str = "", page: int = 1, limit: int = 10) -> dict:
    """Search movies via TMDB API with Chinese support."""
    if not api_key:
        return {"results": [], "total": 0}

    results = []
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Search with Chinese query
            resp = await client.get(
                f"{TMDB_BASE}/search/movie",
                params={
                    "api_key": api_key,
                    "query": query,
                    "page": page,
                    "language": "zh-CN",
                    "include_adult": "false",
                },
            )
            resp.raise_for_status()
            data = resp.json()

            for item in data.get("results", [])[:limit]:
                results.append({
                    "id": str(item["id"]),
                    "title_cn": item.get("title", ""),
                    "title_en": item.get("original_title", ""),
                    "year": int(item.get("release_date", "2000")[:4]) if item.get("release_date") else 0,
                    "poster_url": f"https://image.tmdb.org/t/p/w500{item['poster_path']}" if item.get("poster_path") else "",
                    "director": "",  # Need separate credits call
                })

            total = data.get("total_results", 0)
    except Exception:
        total = 0

    return {"results": results, "total": total}


async def get_movie_detail(movie_id: str, api_key: str = "") -> dict:
    """Get movie details including cast/characters."""
    if not api_key:
        return None

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Get basic info
            resp = await client.get(
                f"{TMDB_BASE}/movie/{movie_id}",
                params={"api_key": api_key, "language": "zh-CN"},
            )
            resp.raise_for_status()
            detail = resp.json()

            # Get credits (cast)
            credits_resp = await client.get(
                f"{TMDB_BASE}/movie/{movie_id}/credits",
                params={"api_key": api_key, "language": "zh-CN"},
            )
            credits_resp.raise_for_status()
            credits = credits_resp.json()

            characters = []
            for cast in credits.get("cast", [])[:10]:
                characters.append({
                    "actor_name": cast.get("name", ""),
                    "character_name": cast.get("character", ""),
                    "profile_path": f"https://image.tmdb.org/t/p/w185{cast['profile_path']}" if cast.get("profile_path") else "",
                })

            directors = []
            for crew in credits.get("crew", []):
                if crew.get("job") == "Director":
                    directors.append(crew.get("name", ""))

            return {
                "id": str(detail["id"]),
                "title_cn": detail.get("title", ""),
                "title_en": detail.get("original_title", ""),
                "year": int(detail.get("release_date", "2000")[:4]) if detail.get("release_date") else 0,
                "poster_url": f"https://image.tmdb.org/t/p/w500{detail['poster_path']}" if detail.get("poster_path") else "",
                "directors": directors,
                "characters": characters,
                "overview": detail.get("overview", ""),
            }
    except Exception:
        return None
