"""Qwen-Image 2.0 generation via bl CLI."""

import asyncio
import json
import uuid
from pathlib import Path

from app.config import settings


async def call_qwen_image(
    image_path: str,
    prompt: str,
    aspect_ratio: str,
    api_key: str,
    output_dir: str,
) -> dict | None:
    """Call Qwen-Image 2.0 via `bl image generate` to generate an image."""
    env = {"DASHSCOPE_API_KEY": api_key}

    output_name = f"{uuid.uuid4().hex}.png"
    output_path = Path(output_dir) / output_name

    # Parse aspect ratio for size param
    size = aspect_ratio  # e.g. "720*1280"

    cmd = [
        "bl", "image", "generate",
        "--prompt", prompt,
        "--image", image_path,
        "--size", size,
        "--output", str(output_path),
    ]

    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env,
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=120)

        if proc.returncode == 0 and output_path.exists():
            return {
                "success": True,
                "output_path": str(output_path),
                "output_name": output_name,
            }
        else:
            error_text = stderr.decode("utf-8", errors="replace")[:500]
            return {"success": False, "error": error_text}
    except asyncio.TimeoutError:
        return {"success": False, "error": "图片生成超时"}
    except Exception as e:
        return {"success": False, "error": str(e)}
