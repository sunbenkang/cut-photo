import asyncio
import json
from datetime import datetime, timedelta, timezone

import httpx
from sqlalchemy import select

from app.models.database import async_session
from app.models.db_models import MovieCache


TMDB_BASE = "https://api.themoviedb.org/3"
CACHE_TTL_HOURS = 24


async def _get_cached(key: str) -> dict | None:
    """Look up a value from the movie cache table."""
    async with async_session() as db:
        result = await db.execute(
            select(MovieCache).where(MovieCache.movie_id == key)
        )
        entry = result.scalar_one_or_none()
        if not entry:
            return None
        # Check expiry
        if entry.expires_at and entry.expires_at < datetime.now(timezone.utc).isoformat():
            await db.delete(entry)
            await db.commit()
            return None
        try:
            return json.loads(entry.raw_data) if entry.raw_data else None
        except json.JSONDecodeError:
            return None


async def _set_cache(key: str, data: dict, ttl_hours: int = CACHE_TTL_HOURS):
    """Store a value in the movie cache table."""
    expires = (datetime.now(timezone.utc) + timedelta(hours=ttl_hours)).isoformat()
    raw = json.dumps(data, ensure_ascii=False)

    async with async_session() as db:
        result = await db.execute(
            select(MovieCache).where(MovieCache.movie_id == key)
        )
        entry = result.scalar_one_or_none()
        if entry:
            entry.raw_data = raw
            entry.expires_at = expires
            entry.cached_at = datetime.now().isoformat()
        else:
            entry = MovieCache(
                movie_id=key,
                raw_data=raw,
                expires_at=expires,
                cached_at=datetime.now().isoformat(),
            )
            db.add(entry)
        await db.commit()


async def search_movies(query: str, api_key: str = "", page: int = 1, limit: int = 10) -> dict:
    """Search movies via TMDB API with Chinese support and local cache."""
    if not api_key:
        return {"results": [], "total": 0}

    cache_key = f"search:{query}:{page}:{limit}"
    cached = await _get_cached(cache_key)
    if cached:
        return cached

    results = []
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
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
                    "director": "",
                })

            total = data.get("total_results", 0)
    except Exception:
        total = 0

    result = {"results": results, "total": total}
    # Cache search results (shorter TTL for searches)
    await _set_cache(cache_key, result, ttl_hours=1)
    return result


async def get_movie_detail(movie_id: str, api_key: str = "") -> dict:
    """Get movie details including cast/characters, with local cache."""
    if not api_key:
        return None

    cache_key = f"detail:{movie_id}"
    cached = await _get_cached(cache_key)
    if cached:
        return cached

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

            result = {
                "id": str(detail["id"]),
                "title_cn": detail.get("title", ""),
                "title_en": detail.get("original_title", ""),
                "year": int(detail.get("release_date", "2000")[:4]) if detail.get("release_date") else 0,
                "poster_url": f"https://image.tmdb.org/t/p/w500{detail['poster_path']}" if detail.get("poster_path") else "",
                "directors": directors,
                "characters": characters,
                "overview": detail.get("overview", ""),
            }

            # Cache movie details
            await _set_cache(cache_key, result)
            return result
    except Exception:
        return None
