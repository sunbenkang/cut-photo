"""Prompt assembly service — fixed 3-part concatenation."""

SYSTEM_BASE_PROMPT = """你是一位专业的电影片场摄影师，请生成一张写实风格的照片。

核心要求：
- 抓拍风格：照片应呈现真实的幕后花絮感，仿佛剧组工作人员随手抓拍
- 片场实景：背景应为真实的电影拍摄现场，包含摄影器材、灯光设备、剧组人员等元素
- 光影统一：人物面部光影方向必须与环境光源一致，色调融合自然
- 透视合理：人物与场景的透视关系真实，仿佛人物真实站在场景中
- 画质要求：高清晰度，电影级色彩调校，自然肤色还原，皮肤质感真实
- 拒绝影楼风：杜绝过度磨皮、影楼打光、不自然的边缘融合

{aspect_ratio_desc}
景深效果：{depth_field_desc}"""


def get_aspect_ratio_desc(value: str) -> str:
    mapping = {
        "720*1280": "画面比例：9:16 竖屏构图",
        "1080*1440": "画面比例：3:4 人像构图",
        "1440*1080": "画面比例：4:3 横版构图",
        "1920*1080": "画面比例：16:9 宽屏构图",
    }
    return mapping.get(value, "")


def get_depth_field_desc(value: str) -> str:
    mapping = {
        "shallow": "浅景深，背景适当虚化，突出人物主体",
        "standard": "标准景深，人物与背景保持自然清晰度",
        "deep": "全景深，前后景均保持清晰，展现完整片场环境",
    }
    return mapping.get(value, "标准景深")


def assemble_prompt(
    aspect_ratio: str,
    depth_of_field: str,
    template_prompt: str = "",
    character_name: str = "",
    user_additions: str = "",
) -> str:
    """Assemble the final prompt from all parts in fixed order."""

    # Part 1: System base prompt
    base = SYSTEM_BASE_PROMPT.format(
        aspect_ratio_desc=get_aspect_ratio_desc(aspect_ratio),
        depth_field_desc=get_depth_field_desc(depth_of_field),
    )

    # Part 2: Template prompt (with character replacement)
    template_part = ""
    if template_prompt:
        template_part = template_prompt.replace("{character}", character_name or "主角")

    # If no template, use character info directly
    if not template_part and character_name:
        template_part = f"照片中与 {character_name} 在片场合影"

    # Part 3: User additions
    user_part = user_additions.strip() if user_additions else ""

    # Assemble
    parts = [base]
    if template_part:
        parts.append("\n场景描述：")
        parts.append(template_part)
    if user_part:
        parts.append("\n补充要求：")
        parts.append(user_part)

    return "\n".join(parts).strip()


def adjust_prompt_for_retry(original_prompt: str, retry_count: int) -> str:
    """Micro-adjust prompt for retry with fixed strategies."""
    from app.utils.retry import get_retry_adjustment
    adjustment = get_retry_adjustment(retry_count)

    # Remove previous adjustments before adding new one
    import re
    cleaned = re.sub(r'\n额外强调：.*', '', original_prompt, flags=re.DOTALL).strip()

    return f"{cleaned}\n额外强调：{adjustment}"
