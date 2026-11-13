from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate, UserPatch


def get_users(db: Session) -> list[User]:
    statement = select(User)
    return list(db.scalars(statement).all())


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_user_by_email(db: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return db.scalars(statement).first()


def create_user(db: Session, user: UserCreate) -> User:
    db_user = User(**user.model_dump())

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def update_user(
    db: Session,
    user_id: int,
    user: UserCreate | UserPatch,
) -> User | None:
    db_user = get_user_by_id(db, user_id)

    if db_user is None:
        return None

    update_data = user.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)

    return db_user


def delete_user(db: Session, user_id: int) -> bool:
    db_user = get_user_by_id(db, user_id)

    if db_user is None:
        return False

    db.delete(db_user)
    db.commit()

    return True
