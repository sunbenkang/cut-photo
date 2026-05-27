from PIL import Image
import io


def get_image_info(file_bytes: bytes) -> dict:
    """Extract basic image info from bytes."""
    try:
        img = Image.open(io.BytesIO(file_bytes))
        return {
            "width": img.width,
            "height": img.height,
            "format": img.format or "UNKNOWN",
            "mode": img.mode,
        }
    except Exception:
        return {"width": 0, "height": 0, "format": "UNKNOWN", "mode": "UNKNOWN"}


def resize_if_needed(file_bytes: bytes, max_bytes: int = 9 * 1024 * 1024) -> bytes:
    """Resize image if it exceeds max_bytes (9MB for Qwen-Image limit)."""
    if len(file_bytes) <= max_bytes:
        return file_bytes

    img = Image.open(io.BytesIO(file_bytes))
    quality = 85
    while len(file_bytes) > max_bytes and quality > 10:
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=quality, optimize=True)
        file_bytes = buf.getvalue()
        quality -= 10

    if len(file_bytes) > max_bytes:
        ratio = (max_bytes / len(file_bytes)) ** 0.5
        new_size = (int(img.width * ratio), int(img.height * ratio))
        img = img.resize(new_size, Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=80, optimize=True)
        file_bytes = buf.getvalue()

    return file_bytes
