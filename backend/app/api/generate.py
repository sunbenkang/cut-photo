import asyncio
import json

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import get_db
from app.models.db_models import Generation, Template
from app.models.schemas import GenerateRequest, GenerateResponse, CancelResponse
from app.services.pipeline_service import (
    run_pipeline,
    get_cancel_event,
    get_sse_queue,
    sse_queues,
)
from app.utils.storage import BASE_DIR

router = APIRouter(prefix="/api/generate", tags=["generate"])


@router.post("", response_model=GenerateResponse)
async def start_generation(
    request: Request,
    body: GenerateRequest,
    db: AsyncSession = Depends(get_db),
):
    user = request.state.user
    task_id = body.upload_id  # Use upload_id as task_id for simplicity

    # Get original image path
    original_dir = BASE_DIR / "data" / "originals" / str(user.id)
    matches = list(original_dir.glob(f"{body.upload_id}.*"))
    if not matches:
        raise HTTPException(status_code=404, detail="上传文件未找到，请重新上传")

    original_path = str(matches[0].relative_to(BASE_DIR))

    # Get template prompt if specified
    template_prompt = ""
    template_name = ""
    if body.template_id:
        result = await db.execute(select(Template).where(Template.id == body.template_id))
        template = result.scalar_one_or_none()
        if template:
            template_prompt = template.prompt_template
            template_name = template.name

    # Build face bbox JSON if faces selected
    face_bbox = None
    if body.face_index >= 0:
        face_bbox = json.dumps({"index": body.face_index})

    # Get image dimensions
    from PIL import Image
    try:
        img = Image.open(BASE_DIR / original_path)
        w, h = img.size
    except Exception:
        w, h = 0, 0

    # Start pipeline in background
    asyncio.create_task(
        run_pipeline(
            task_id=task_id,
            user_id=user.id,
            app_key=user.app_key,
            upload_id=body.upload_id,
            face_index=body.face_index,
            movie_id=body.movie_id,
            character_name=body.character_name,
            aspect_ratio=body.aspect_ratio,
            depth_of_field=body.depth_of_field,
            template_id=body.template_id,
            template_prompt=template_prompt,
            template_name=template_name,
            user_prompt=body.user_prompt,
            prompt_multiplier=getattr(body, "prompt_multiplier", 1) or 1,
            original_image_path=original_path,
            original_width=w,
            original_height=h,
            face_bbox=face_bbox,
        )
    )

    return GenerateResponse(task_id=task_id, status="queued")


@router.get("/{task_id}/status")
async def stream_status(task_id: str):
    """SSE endpoint for pipeline status updates."""
    queue = get_sse_queue(task_id)

    async def event_generator():
        while True:
            msg = await queue.get()
            if msg is None:
                break
            event = msg.get("event", "message")
            data = json.dumps(msg.get("data", {}), ensure_ascii=False)
            yield f"event: {event}\ndata: {data}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/{task_id}/cancel", response_model=CancelResponse)
async def cancel_generation(task_id: str):
    """Cancel a running pipeline."""
    cancel = get_cancel_event(task_id)
    cancel.set()
    return CancelResponse(status="cancelled")
