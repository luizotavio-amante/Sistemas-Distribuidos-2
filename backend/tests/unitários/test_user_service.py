from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException

from app.schemas.user import UserCreate, UserPatch
from app.services import user


def criar_usuario(
    user_id=1,
    name="Luiz",
    email="luiz@email.com",
):
    return SimpleNamespace(
        id=user_id,
        name=name,
        email=email,
    )


def test_create_user():
    db = MagicMock()
    dados = UserCreate(
        name="Luiz",
        email="luiz@email.com",
    )
    usuario_criado = criar_usuario()

    with (
        patch.object(
            user.user_repository,
            "get_user_by_email",
            return_value=None,
        ) as buscar_email,
        patch.object(
            user.user_repository,
            "create_user",
            return_value=usuario_criado,
        ) as criar,
    ):
        resultado = user.create_user(db, dados)

    assert resultado.id == 1
    assert resultado.name == "Luiz"
    assert resultado.email == "luiz@email.com"
    buscar_email.assert_called_once_with(db, dados.email)
    criar.assert_called_once_with(db, dados)


def test_get_user():
    db = MagicMock()
    usuario = criar_usuario()

    with patch.object(
        user.user_repository,
        "get_user_by_id",
        return_value=usuario,
    ) as buscar:
        resultado = user.get_user(db, 1)

    assert resultado.id == 1
    assert resultado.name == "Luiz"
    buscar.assert_called_once_with(db, 1)


def test_get_users():
    db = MagicMock()
    usuarios = [
        criar_usuario(1, "Luiz", "luiz@email.com"),
        criar_usuario(2, "Joao", "joao@email.com"),
    ]

    with patch.object(
        user.user_repository,
        "get_users",
        return_value=usuarios,
    ) as listar:
        resultado = user.get_users(db)

    assert len(resultado) == 2
    assert resultado[0].name == "Luiz"
    assert resultado[1].name == "Joao"
    listar.assert_called_once_with(db)


def test_get_users_filtrado():
    db = MagicMock()
    usuarios = [
        criar_usuario(1, "Luiz", "luiz@email.com"),
        criar_usuario(2, "Joao", "joao@email.com"),
    ]

    with patch.object(
        user.user_repository,
        "get_users",
        return_value=usuarios,
    ):
        resultado = user.get_users(db, name="LUI")

    assert len(resultado) == 1
    assert resultado[0].name == "Luiz"


def test_update_user():
    db = MagicMock()
    dados = UserCreate(
        name="Luiz Otavio",
        email="novo@email.com",
    )
    usuario_atualizado = criar_usuario(1, "Luiz Otavio", "novo@email.com")

    with (
        patch.object(
            user.user_repository,
            "get_user_by_id",
            return_value=criar_usuario(),
        ),
        patch.object(
            user.user_repository,
            "get_user_by_email",
            return_value=None,
        ),
        patch.object(
            user.user_repository,
            "update_user",
            return_value=usuario_atualizado,
        ) as atualizar,
    ):
        resultado = user.update_user(db, 1, dados)

    assert resultado.name == "Luiz Otavio"
    assert resultado.email == "novo@email.com"
    atualizar.assert_called_once_with(db, 1, dados)


def test_patch_user():
    db = MagicMock()
    dados = UserPatch(name="Luiz Otavio")
    usuario_atualizado = criar_usuario(1, "Luiz Otavio", "luiz@email.com")

    with (
        patch.object(
            user.user_repository,
            "get_user_by_id",
            return_value=criar_usuario(),
        ),
        patch.object(
            user.user_repository,
            "update_user",
            return_value=usuario_atualizado,
        ) as atualizar,
    ):
        resultado = user.patch_user(db, 1, dados)

    assert resultado.name == "Luiz Otavio"
    assert resultado.email == "luiz@email.com"
    atualizar.assert_called_once_with(db, 1, dados)


def test_delete_user():
    db = MagicMock()

    with (
        patch.object(
            user.user_repository,
            "get_user_by_id",
            return_value=criar_usuario(),
        ),
        patch.object(
            user.user_repository,
            "delete_user",
        ) as excluir,
    ):
        resultado = user.delete_user(db, 1)

    assert resultado == {"message": "Usuário removido com sucesso"}
    excluir.assert_called_once_with(db, 1)


def test_get_user_inexistente():
    db = MagicMock()

    with (
        patch.object(
            user.user_repository,
            "get_user_by_id",
            return_value=None,
        ),
        pytest.raises(HTTPException) as erro,
    ):
        user.get_user(db, 999)

    assert erro.value.status_code == 404


def test_create_user_email_duplicado():
    db = MagicMock()
    dados = UserCreate(
        name="Luiz",
        email="luiz@email.com",
    )

    with (
        patch.object(
            user.user_repository,
            "get_user_by_email",
            return_value=criar_usuario(),
        ),
        patch.object(
            user.user_repository,
            "create_user",
        ) as criar,
        pytest.raises(HTTPException) as erro,
    ):
        user.create_user(db, dados)

    assert erro.value.status_code == 409
    criar.assert_not_called()
