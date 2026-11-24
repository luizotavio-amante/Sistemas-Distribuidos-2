from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard import DashboardService

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)

DbSession = Annotated[Session, Depends(get_db)]


@router.get("", response_model=DashboardResponse)
def get_dashboard(db: DbSession):
    return DashboardService(db).get_summary()
