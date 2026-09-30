from fastapi import APIRouter, HTTPException, Query

from app.schemas.user import User, UserCreate, UserPatch
from app.services.user import (
    create_user,
    delete_user,
    get_user,
    get_users,
    patch_user,
    update_user,
)

router = APIRouter()


@router.get("/", response_model=list[User])
def list_users(
    name: str | None = Query(default=None),
):
    users = get_users()

    if name:
        users = [user for user in users if name.lower() in user.name.lower()]

    return users


@router.get("/{user_id}", response_model=User)
def find_user(user_id: int):
    user = get_user(user_id)

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado",
        )

    return user


@router.post("/", response_model=User, status_code=201)
def create(user: UserCreate):
    return create_user(user)


@router.put("/{user_id}", response_model=User)
def update(user_id: int, user: UserCreate):
    updated_user = update_user(
        user_id,
        user.name,
        user.email,
    )

    if updated_user is None:
        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado",
        )

    return updated_user


@router.patch("/{user_id}", response_model=User)
def partial_update(user_id: int, data: UserPatch):
    updated_user = patch_user(user_id, data)

    if updated_user is None:
        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado",
        )

    return updated_user


@router.delete("/{user_id}")
def remove(user_id: int):
    deleted = delete_user(user_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado",
        )

    return {"message": "Usuário removido com sucesso"}
