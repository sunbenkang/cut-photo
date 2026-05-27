from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import get_db
from app.models.db_models import Template
from app.models.schemas import TemplateOut

router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("", response_model=list[TemplateOut])
async def list_templates(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Template).where(Template.is_active == 1).order_by(Template.sort_order)
    )
    templates = result.scalars().all()
    return [TemplateOut.model_validate(t) for t in templates]
