from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.repositories.user import UserRepository
from app.schemas.user import TokenResponse, UserCreate, UserLogin


class AuthService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = UserRepository(db)

    def register(self, data: UserCreate) -> User:
        existing_user = self.repository.get_by_email(data.email)

        if existing_user is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="E-mail já cadastrado",
            )

        if len(data.name.strip()) < 2:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Informe um nome válido",
            )

        hashed_password = hash_password(data.password)

        try:
            return self.repository.create(
                name=data.name,
                email=data.email,
                password_hash=hashed_password,
            )

        except IntegrityError as error:
            self.db.rollback()

            if getattr(error.orig, "sqlstate", None) == "23505":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="E-mail já cadastrado",
                ) from error

            raise

    def login(self, data: UserLogin) -> TokenResponse:
        user = self.repository.get_by_email(data.email)

        if user is None or not verify_password(
            data.password,
            user.password_hash,
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="E-mail ou senha inválidos",
                headers={"WWW-Authenticate": "Bearer"},
            )

        token = create_access_token(user.id)

        return TokenResponse(
            access_token=token,
            token_type="bearer",
        )
