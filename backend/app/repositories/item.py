from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.item import Item


def get_items(db: Session) -> list[Item]:
    return list(db.scalars(select(Item).order_by(Item.id)).all())


def get_item_by_name(db: Session, name: str) -> Item | None:
    return db.scalar(select(Item).where(Item.name == name))


def create_item(
    db: Session,
    name: str,
    description: str | None = None,
) -> Item:
    item = Item(
        name=name,
        description=description,
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return item
