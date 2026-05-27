import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pathlib import Path

from app.models.database import get_db
from app.models.schemas import UploadResponse
from app.services.validation_service import validate_image
from app.utils.storage import get_original_dir, generate_filename, BASE_DIR

router = APIRouter(prefix="/api", tags=["upload"])


@router.post("/upload", response_model=UploadResponse)
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    user = request.state.user
    contents = await file.read()

    if not contents:
        raise HTTPException(status_code=422, detail="上传文件为空")

    # Save original file
    upload_id = uuid.uuid4().hex
    ext = Path(file.filename).suffix if file.filename else ".jpg"
    if ext.lower() not in (".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif"):
        ext = ".jpg"
    filename = f"{upload_id}{ext}"
    save_dir = get_original_dir(user.id)
    save_path = save_dir / filename
    save_path.write_bytes(contents)

    # Run validation
    layers, faces, w, h = await validate_image(str(save_path), user.app_key, contents)

    valid = all(layer.passed for layer in layers)

    preview_url = f"/api/files/originals/{user.id}/{filename}"

    return UploadResponse(
        upload_id=upload_id,
        status="completed" if valid else "failed",
        valid=valid,
        layers=layers,
        faces=faces,
        preview_url=preview_url,
        original_width=w,
        original_height=h,
    )


@router.get("/files/originals/{user_id}/{filename}")
async def serve_original(user_id: int, filename: str):
    file_path = BASE_DIR / "data" / "originals" / str(user_id) / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")
    return FileResponse(str(file_path))


@router.get("/files/works/{user_id}/{filename}")
async def serve_work(user_id: int, filename: str):
    file_path = BASE_DIR / "data" / "works" / str(user_id) / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")
    return FileResponse(str(file_path))
