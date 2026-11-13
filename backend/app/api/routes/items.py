from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.item import ItemCreate, ItemResponse
from app.services import item as item_service

router = APIRouter()

DbSession = Annotated[Session, Depends(get_db)]


@router.get("/", response_model=list[ItemResponse])
def list_items(db: DbSession):
    return item_service.list_items(db)


@router.post(
    "/",
    response_model=ItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_item(data: ItemCreate, db: DbSession):
    return item_service.create_item(db, data)
