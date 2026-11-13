
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.item import Item
from app.repositories import item as item_repository
from app.schemas.item import ItemCreate


def list_items(db: Session) -> list[Item]:
    return item_repository.get_items(db)


def create_item(db: Session, data: ItemCreate) -> Item:
    existing_item = item_repository.get_item_by_name(
        db,
        data.name,
    )

    if existing_item is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="ja existe um item com esse nome",
        )

    return item_repository.create_item(
        db=db,
        name=data.name,
        description=data.description,
    )
