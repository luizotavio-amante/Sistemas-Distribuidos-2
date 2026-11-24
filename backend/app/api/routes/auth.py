from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import CurrentUser
from app.database.session import get_db
from app.schemas.user import (
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)
from app.services.auth import AuthService

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

DbSession = Annotated[Session, Depends(get_db)]


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(data: UserCreate, db: DbSession):
    return AuthService(db).register(data)


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(data: UserLogin, db: DbSession):
    return AuthService(db).login(data)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: CurrentUser):
    return current_user
