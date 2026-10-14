from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories import user as user_repository
from app.schemas.user import UserCreate, UserPatch


def get_users(db: Session, name: str | None = None):
    users = user_repository.get_users(db)

    if name:
        users = [user for user in users if name.lower() in user.name.lower()]

    return users


def get_user(db: Session, user_id: int):
    user = user_repository.get_user_by_id(db, user_id)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado",
        )

    return user


def create_user(db: Session, user: UserCreate):
    existing_user = user_repository.get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="E-mail já cadastrado",
        )

    return user_repository.create_user(db, user)


def update_user(db: Session, user_id: int, user: UserCreate):
    get_user(db, user_id)

    existing_user = user_repository.get_user_by_email(db, user.email)

    if existing_user and existing_user.id != user_id:
        raise HTTPException(
            status_code=409,
            detail="E-mail já cadastrado",
        )

    return user_repository.update_user(db, user_id, user)


def patch_user(db: Session, user_id: int, user: UserPatch):
    get_user(db, user_id)

    if user.email is not None:
        existing_user = user_repository.get_user_by_email(db, user.email)

        if existing_user and existing_user.id != user_id:
            raise HTTPException(
                status_code=409,
                detail="E-mail já cadastrado",
            )

    return user_repository.update_user(db, user_id, user)


def delete_user(db: Session, user_id: int):
    get_user(db, user_id)

    user_repository.delete_user(db, user_id)

    return {"message": "Usuário removido com sucesso"}
