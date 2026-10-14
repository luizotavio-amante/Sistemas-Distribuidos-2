from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.user import User, UserCreate, UserPatch
from app.services import user as user_service

DatabaseSession = Annotated[Session, Depends(get_db)]

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.get("/", response_model=list[User])
def list_users(
    db: DatabaseSession,
    name: str | None = None,
):
    return user_service.get_users(db, name)


@router.get("/{user_id}", response_model=User)
def get_user(
    user_id: int,
    db: DatabaseSession,
):
    return user_service.get_user(db, user_id)


@router.post(
    "/",
    response_model=User,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    user: UserCreate,
    db: DatabaseSession,
):
    return user_service.create_user(db, user)


@router.put("/{user_id}", response_model=User)
def update_user(
    user_id: int,
    user: UserCreate,
    db: DatabaseSession,
):
    return user_service.update_user(db, user_id, user)


@router.patch("/{user_id}", response_model=User)
def patch_user(
    user_id: int,
    user: UserPatch,
    db: DatabaseSession,
):
    return user_service.patch_user(db, user_id, user)


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: DatabaseSession,
):
    return user_service.delete_user(db, user_id)
