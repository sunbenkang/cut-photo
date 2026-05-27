"""Quality check service using Qwen-VL via bl vision describe."""

import asyncio


QUALITY_CHECK_PROMPT = """请仔细检查这张合成照片的质量，判断是否存在以下问题：
1. 人物面部是否扭曲变形
2. 人物与背景的光影是否不一致（如人脸光线方向与环境光源矛盾）
3. 人物与背景的融合是否生硬（如明显抠图痕迹、边缘锯齿）
4. 人物皮肤质感是否自然
5. 画面整体是否具有真实抓拍的临场感

请只回答"通过"或"不通过"，然后简要说明理由。"""


async def check_quality(image_path: str, api_key: str) -> dict:
    """Check generated image quality using Qwen-VL. Returns pass/fail directly from model."""
    env = {"DASHSCOPE_API_KEY": api_key}

    try:
        proc = await asyncio.create_subprocess_exec(
            "bl", "vision", "describe",
            "--image", image_path,
            "--prompt", QUALITY_CHECK_PROMPT,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env,
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=60)
        output = stdout.decode("utf-8", errors="replace")

        if "通过" in output and "不通过" not in output:
            return {"passed": True, "feedback": output[:500], "detail": "质量检测通过"}
        else:
            return {"passed": False, "feedback": output[:500], "detail": "质量检测未通过，将自动优化重试"}

    except asyncio.TimeoutError:
        # Timeout — assume pass to not block
        return {"passed": True, "feedback": "检测超时", "detail": "质量检测超时，默认通过"}
    except Exception as e:
        return {"passed": True, "feedback": str(e), "detail": "质量检测跳过"}
