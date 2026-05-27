RETRY_ADJUSTMENTS = [
    "强调摄影风格：写实抓拍，自然光线，幕后花絮感，拒绝摆拍",
    "加强电影级布光效果，环境光融合，皮肤质感真实自然，人物与背景融为一体",
    "确保人物与场景光照方向一致，色调统一，真实感优先，完全避免影楼风格",
    "提高画面细节真实度：衣物质感、皮肤纹理、环境细节均需保持高还原度",
    "强化抓拍感：人物表情自然，动作随性，仿佛拍摄现场的偶然记录",
]


def get_retry_adjustment(retry_count: int) -> str:
    """Get the prompt adjustment for a given retry attempt."""
    idx = (retry_count - 1) % len(RETRY_ADJUSTMENTS)
    return RETRY_ADJUSTMENTS[idx]
