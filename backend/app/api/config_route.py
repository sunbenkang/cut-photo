from fastapi import APIRouter

router = APIRouter(prefix="/api/config", tags=["config"])

ASPECT_RATIOS = [
    {"label": "9:16 竖屏", "value": "720*1280"},
    {"label": "3:4 人像", "value": "1080*1440"},
    {"label": "4:3 横版", "value": "1440*1080"},
    {"label": "16:9 宽屏", "value": "1920*1080"},
]

DEPTH_OF_FIELDS = [
    {"label": "浅景深", "value": "shallow", "description": "背景虚化，突出人物"},
    {"label": "标准景深", "value": "standard", "description": "适中的背景清晰度"},
    {"label": "全景深", "value": "deep", "description": "前后景均清晰"},
]


@router.get("")
async def get_config():
    return {
        "aspect_ratios": ASPECT_RATIOS,
        "depth_of_fields": DEPTH_OF_FIELDS,
    }
