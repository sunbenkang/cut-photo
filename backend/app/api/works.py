from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import FileResponse
from sqlalchemy import select, func, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import get_db
from app.models.db_models import Work
from app.models.schemas import WorkOut, WorkListResponse, WorkDetail, ClearWorksResponse
from app.utils.storage import BASE_DIR, delete_file

router = APIRouter(prefix="/api/works", tags=["works"])


@router.get("", response_model=WorkListResponse)
async def list_works(
    request: Request,
    sort: str = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    user = request.state.user

    order_col = desc(Work.created_at) if sort == "desc" else asc(Work.created_at)

    # Count
    count_result = await db.execute(
        select(func.count(Work.id)).where(Work.user_id == user.id)
    )
    total = count_result.scalar()

    # Fetch
    result = await db.execute(
        select(Work)
        .where(Work.user_id == user.id)
        .order_by(order_col)
        .offset((page - 1) * limit)
        .limit(limit)
    )
    works = result.scalars().all()

    items = []
    for w in works:
        filename = w.image_path.split("/")[-1] if "/" in w.image_path else w.image_path
        items.append(WorkOut(
            id=w.id,
            image_url=f"/api/files/works/{user.id}/{filename}",
            movie_title_cn=w.movie_title_cn,
            movie_title_en=w.movie_title_en,
            character_name=w.character_name,
            aspect_ratio=w.aspect_ratio,
            depth_of_field=w.depth_of_field,
            template_name=w.template_name,
            file_size=w.file_size,
            width=w.original_width,
            height=w.original_height,
            created_at=w.created_at,
        ))

    return WorkListResponse(works=items, total=total, page=page, limit=limit)


@router.get("/{work_id}", response_model=WorkDetail)
async def get_work(work_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    user = request.state.user
    result = await db.execute(
        select(Work).where(Work.id == work_id, Work.user_id == user.id)
    )
    work = result.scalar_one_or_none()
    if not work:
        raise HTTPException(status_code=404, detail="作品不存在")

    filename = work.image_path.split("/")[-1] if "/" in work.image_path else work.image_path
    return WorkDetail(
        id=work.id,
        image_url=f"/api/files/works/{user.id}/{filename}",
        movie_title_cn=work.movie_title_cn,
        movie_title_en=work.movie_title_en,
        character_name=work.character_name,
        aspect_ratio=work.aspect_ratio,
        depth_of_field=work.depth_of_field,
        template_name=work.template_name,
        file_size=work.file_size,
        width=work.original_width,
        height=work.original_height,
        created_at=work.created_at,
        prompt_snapshot=work.prompt_snapshot,
        retry_count=work.retry_count or 0,
    )


@router.get("/{work_id}/download")
async def download_work(work_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    user = request.state.user
    result = await db.execute(
        select(Work).where(Work.id == work_id, Work.user_id == user.id)
    )
    work = result.scalar_one_or_none()
    if not work:
        raise HTTPException(status_code=404, detail="作品不存在")

    file_path = BASE_DIR / work.image_path
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")

    filename = work.image_path.split("/")[-1] if "/" in work.image_path else "work.png"
    return FileResponse(str(file_path), filename=filename, media_type="image/png")


@router.delete("/{work_id}")
async def delete_work(work_id: int, request: Request, db: AsyncSession = Depends(get_db)):
    user = request.state.user
    result = await db.execute(
        select(Work).where(Work.id == work_id, Work.user_id == user.id)
    )
    work = result.scalar_one_or_none()
    if not work:
        raise HTTPException(status_code=404, detail="作品不存在")

    # Delete file
    delete_file(work.image_path)

    # Delete record
    await db.delete(work)
    await db.commit()

    return {"status": "deleted"}


@router.delete("", response_model=ClearWorksResponse)
async def clear_works(request: Request, db: AsyncSession = Depends(get_db)):
    user = request.state.user

    result = await db.execute(select(Work).where(Work.user_id == user.id))
    works = result.scalars().all()

    count = len(works)
    for work in works:
        delete_file(work.image_path)
        await db.delete(work)

    await db.commit()
    return ClearWorksResponse(status="cleared", deleted_count=count)
