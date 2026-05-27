"""Full generation pipeline orchestrator with SSE streaming and cancel support."""

import asyncio
import json
from datetime import datetime
from pathlib import Path

from app.models.database import async_session
from app.models.db_models import Generation, Work
from app.services.prompt_service import assemble_prompt, adjust_prompt_for_retry
from app.services.generation_service import call_qwen_image
from app.services.quality_service import check_quality
from app.utils.storage import get_works_dir, BASE_DIR


# In-memory cancel flags: task_id -> asyncio.Event
cancel_events: dict[str, asyncio.Event] = {}

# SSE queues: task_id -> asyncio.Queue
sse_queues: dict[str, asyncio.Queue] = {}


def get_cancel_event(task_id: str) -> asyncio.Event:
    if task_id not in cancel_events:
        cancel_events[task_id] = asyncio.Event()
    return cancel_events[task_id]


def get_sse_queue(task_id: str) -> asyncio.Queue:
    if task_id not in sse_queues:
        sse_queues[task_id] = asyncio.Queue()
    return sse_queues[task_id]


async def send_sse(task_id: str, event: str, data: dict):
    """Send an SSE event to the client."""
    queue = get_sse_queue(task_id)
    await queue.put({"event": event, "data": data})


async def cleanup_task(task_id: str):
    """Clean up task resources."""
    cancel_events.pop(task_id, None)
    queue = sse_queues.pop(task_id, None)
    if queue:
        # Signal end of stream
        await queue.put(None)


async def run_pipeline(
    task_id: str,
    user_id: int,
    app_key: str,
    upload_id: str,
    face_index: int,
    movie_id: str | None,
    character_name: str | None,
    aspect_ratio: str,
    depth_of_field: str,
    template_id: int | None,
    template_prompt: str,
    template_name: str,
    user_prompt: str,
    original_image_path: str,
    original_width: int,
    original_height: int,
    face_bbox: str | None,
):
    cancel = get_cancel_event(task_id)

    # ── Step 1: Save generation record ──
    async with async_session() as db:
        generation = Generation(
            user_id=user_id,
            task_id=task_id,
            original_image_path=original_image_path,
            original_width=original_width,
            original_height=original_height,
            selected_face_bbox=face_bbox,
            movie_id=movie_id,
            character_name=character_name,
            aspect_ratio=aspect_ratio,
            depth_of_field=depth_of_field,
            template_id=template_id,
            template_name=template_name,
            status="preprocessing",
            started_at=datetime.now().isoformat(),
        )
        db.add(generation)
        await db.commit()
        gen_id = generation.id

    try:
        # ── Step 2: Assemble initial prompt ──
        await send_sse(task_id, "stage", {"stage": "preprocessing", "message": "正在组装提示词...", "progress": 10})
        if cancel.is_set():
            return await _cancel_generation(gen_id, task_id)

        final_prompt = assemble_prompt(
            aspect_ratio=aspect_ratio,
            depth_of_field=depth_of_field,
            template_prompt=template_prompt,
            character_name=character_name or "",
            user_additions=user_prompt,
        )

        async with async_session() as db:
            gen = await db.get(Generation, gen_id)
            gen.base_prompt = final_prompt
            gen.final_prompt = final_prompt
            gen.status = "generating"
            await db.commit()

        # ── Step 3: Generate image (with retry loop) ──
        retry_count = 0
        max_quality_checks = 50  # safety cap; user can cancel anytime
        quality_results = []
        current_prompt = final_prompt
        works_dir = get_works_dir(user_id)

        while retry_count <= max_quality_checks:
            if cancel.is_set():
                return await _cancel_generation(gen_id, task_id)

            await send_sse(task_id, "stage", {
                "stage": "generating",
                "message": f"正在生成图像...（第 {retry_count + 1} 次）",
                "progress": 30 + retry_count * 2,
                "attempt": retry_count + 1,
            })

            result = await call_qwen_image(
                image_path=str(BASE_DIR / original_image_path),
                prompt=current_prompt,
                aspect_ratio=aspect_ratio,
                api_key=app_key,
                output_dir=str(works_dir),
            )

            if cancel.is_set():
                return await _cancel_generation(gen_id, task_id)

            if not result or not result.get("success"):
                retry_count += 1
                quality_results.append({"attempt": retry_count, "passed": False, "detail": result.get("error", "生成失败")})
                current_prompt = adjust_prompt_for_retry(current_prompt, retry_count)
                continue

            # ── Step 4: Quality check ──
            await send_sse(task_id, "stage", {
                "stage": "quality_check",
                "message": "正在检测图像质量...",
                "progress": 60 + retry_count * 2,
                "attempt": retry_count + 1,
            })

            quality = await check_quality(result["output_path"], api_key=app_key)

            if cancel.is_set():
                return await _cancel_generation(gen_id, task_id)

            quality_results.append({"attempt": retry_count + 1, "passed": quality["passed"], "detail": quality.get("detail", "")})

            if quality["passed"]:
                # ── Success! Save work ──
                output_path = Path(result["output_path"])
                file_size = output_path.stat().st_size if output_path.exists() else 0

                from PIL import Image
                try:
                    img = Image.open(output_path)
                    w, h = img.size
                except Exception:
                    w, h = 0, 0

                # Determine movie titles
                movie_title_cn = None
                movie_title_en = None
                if movie_id:
                    from app.services.movie_service import get_movie_detail, settings
                    detail = await get_movie_detail(movie_id, settings.tmdb_api_key)
                    if detail:
                        movie_title_cn = detail.get("title_cn")
                        movie_title_en = detail.get("title_en")

                async with async_session() as db:
                    gen = await db.get(Generation, gen_id)
                    gen.status = "completed"
                    gen.retry_count = retry_count
                    gen.quality_results = json.dumps(quality_results, ensure_ascii=False)
                    gen.final_prompt = current_prompt
                    gen.completed_at = datetime.now().isoformat()

                    work = Work(
                        generation_id=gen_id,
                        user_id=user_id,
                        image_path=str(output_path.relative_to(BASE_DIR)),
                        original_width=w,
                        original_height=h,
                        file_size=file_size,
                        movie_title_cn=movie_title_cn,
                        movie_title_en=movie_title_en,
                        character_name=character_name,
                        aspect_ratio=aspect_ratio,
                        depth_of_field=depth_of_field,
                        template_name=template_name,
                        prompt_snapshot=current_prompt,
                        retry_count=retry_count,
                    )
                    db.add(work)
                    await db.commit()

                    work_id = work.id
                    image_rel = work.image_path

                await send_sse(task_id, "complete", {
                    "work_id": work_id,
                    "image_url": f"/api/files/works/{user_id}/{Path(image_rel).name}" if image_rel else "",
                    "width": w,
                    "height": h,
                    "file_size": file_size,
                    "retry_count": retry_count,
                    "message": "生成完成！",
                })
                await cleanup_task(task_id)
                return

            # Quality check failed — retry
            retry_count += 1
            await send_sse(task_id, "retry", {
                "attempt": retry_count,
                "message": f"质量检测未通过，正在优化重试...",
                "adjustment": "优化提示词：强调真实抓拍与光影融合",
            })
            current_prompt = adjust_prompt_for_retry(current_prompt, retry_count)

        # Exceeded max retries
        await send_sse(task_id, "error", {
            "message": "已达到最大重试次数，仍未生成满意结果。请尝试更换照片或参数后重试。",
            "code": "MAX_RETRIES_EXCEEDED",
        })

    except Exception as e:
        async with async_session() as db:
            gen = await db.get(Generation, gen_id)
            if gen:
                gen.status = "failed"
                gen.error_message = str(e)
                await db.commit()

        await send_sse(task_id, "error", {
            "message": f"生成过程出错: {str(e)}",
            "code": "PIPELINE_ERROR",
        })
    finally:
        await cleanup_task(task_id)


async def _cancel_generation(gen_id: int, task_id: str):
    """Handle cancellation."""
    async with async_session() as db:
        gen = await db.get(Generation, gen_id)
        if gen:
            gen.status = "cancelled"
            gen.completed_at = datetime.now().isoformat()
            await db.commit()

    await send_sse(task_id, "cancelled", {"message": "已取消生成"})
    await cleanup_task(task_id)
