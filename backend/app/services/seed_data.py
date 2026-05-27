"""Seed initial templates into the database."""

from sqlalchemy import select

from app.models.database import async_session
from app.models.db_models import Template

DEFAULT_TEMPLATES = [
    {
        "name": "古装片场",
        "description": "古装影视剧拍摄现场，身着戏服的演员在古建筑布景中",
        "prompt_template": "在繁忙的古装影视拍摄基地，{character}身着精致的古装戏服，站在古色古香的宫殿布景前。周围有摄像机、灯光架、反光板等专业设备，工作人员在旁忙碌。阳光透过仿古窗棂洒落，空气中弥漫着轻微的烟尘，营造出真实的片场氛围。",
        "depth_of_field": "shallow",
        "aspect_ratio": "720*1280",
        "sort_order": 1,
    },
    {
        "name": "现代影视棚",
        "description": "现代都市剧的室内摄影棚，绿幕、灯光和专业设备环绕",
        "prompt_template": "在现代影视剧的室内摄影棚中，{character}穿着都市时尚风格的服装，坐在搭建的咖啡厅场景里。四周是专业的摄影器材、监视器和灯光阵列，工作人员正在调试设备。柔和的棚内灯光营造出温暖的氛围，摄像机正对着演员，捕捉最自然的瞬间。",
        "depth_of_field": "standard",
        "aspect_ratio": "720*1280",
        "sort_order": 2,
    },
    {
        "name": "外景剧组",
        "description": "户外实景拍摄现场，自然光线下的电影剧组",
        "prompt_template": "在开阔的户外电影拍摄现场，{character}身穿角色服装，站在自然风景中。身后是大型的反光板、轨道和摄像机设备，帐篷下导演盯着监视器。自然光线洒在演员脸上，远处有群山或树林作为背景，风吹动衣角，画面真实而生动。",
        "depth_of_field": "deep",
        "aspect_ratio": "1920*1080",
        "sort_order": 3,
    },
    {
        "name": "年代戏片场",
        "description": "民国或近代历史题材的拍摄场景",
        "prompt_template": "在年代戏的拍摄现场，{character}穿着民国时期的复古服装，站在精心布置的老上海街道场景中。周围是轨道车、古董道具和忙碌的场务人员，导演正在不远处指导。暖黄色的调光模拟出怀旧的年代感，画面充满电影质感。",
        "depth_of_field": "standard",
        "aspect_ratio": "1080*1440",
        "sort_order": 4,
    },
    {
        "name": "科幻片场",
        "description": "科幻大片拍摄现场，绿幕与科技感设备",
        "prompt_template": "在科幻大片的拍摄现场，{character}穿着未来感十足的戏服，站在布满绿幕和动作捕捉设备的摄影棚中。周围是高科技摄影器材、LED虚拟背景墙和复杂的机械装置。冷色调的灯光营造出科幻氛围，演员在导演指令下进行表演。",
        "depth_of_field": "shallow",
        "aspect_ratio": "1920*1080",
        "sort_order": 5,
    },
    {
        "name": "动作片现场",
        "description": "动作电影的拍摄场景，威亚和特技设备",
        "prompt_template": "在动作电影的拍摄现场，{character}在布满威亚钢丝和安全垫的场地中。旁边是特技指导、烟火师和摄影团队，监视器上实时显示着画面。专业的灯光设备模拟出戏剧性的光影效果，空气中弥漫着紧张而专业的工作氛围。",
        "depth_of_field": "standard",
        "aspect_ratio": "1920*1080",
        "sort_order": 6,
    },
    {
        "name": "文艺片场",
        "description": "文艺电影的拍摄场景，自然光影与简约布景",
        "prompt_template": "在文艺电影的拍摄现场，{character}坐在简约而富有设计感的场景中。窗外透入柔和的自然光，室内只有最基础的摄影设备和低调的工作人员。导演轻声与演员交流，整个片场弥漫着静谧而专注的创作氛围，画面如油画般质感。",
        "depth_of_field": "shallow",
        "aspect_ratio": "1080*1440",
        "sort_order": 7,
    },
]


async def seed_templates():
    async with async_session() as db:
        result = await db.execute(select(Template).limit(1))
        existing = result.scalar_one_or_none()

        if existing:
            return  # Already seeded

        for t_data in DEFAULT_TEMPLATES:
            template = Template(**t_data)
            db.add(template)

        await db.commit()
