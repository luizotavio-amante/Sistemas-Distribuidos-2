
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException

from app.schemas.user import UserCreate, UserPatch
from app.services import user


def make_user(user_id=1, name="Luiz", email="luiz@email.com"):
    mock_user = MagicMock()
    mock_user.id = user_id
    mock_user.name = name
    mock_user.email = email
    return mock_user



@patch("app.services.user.user_repository")
def test_create_user(repository):
    repository.get_user_by_email.return_value = None
    repository.create_user.return_value = make_user()

    data = UserCreate(name="Luiz", email="luiz@email.com")

    created_user = user.create_user(MagicMock(), data)

    assert created_user.id == 1
    assert created_user.name == "Luiz"
    assert created_user.email == "luiz@email.com"


@patch("app.services.user.user_repository")
def test_get_user(repository):
    repository.get_user_by_id.return_value = make_user()

    found_user = user.get_user(MagicMock(), 1)

    assert found_user.id == 1
    assert found_user.name == "Luiz"


@patch("app.services.user.user_repository")
def test_get_users(repository):
    repository.get_users.return_value = [
        make_user(1, "Luiz", "luiz@email.com"),
        make_user(2, "João", "joao@email.com"),
    ]

    users = user.get_users(MagicMock())

    assert len(users) == 2
    assert users[0].name == "Luiz"
    assert users[1].name == "João"


@patch("app.services.user.user_repository")
def test_update_user(repository):
    repository.get_user_by_id.return_value = make_user()
    repository.get_user_by_email.return_value = None
    repository.update_user.return_value = make_user(
        1, "Luiz Otavio", "novo@email.com"
    )

    data = UserCreate(
        name="Luiz Otavio",
        email="novo@email.com",
    )

    updated_user = user.update_user(MagicMock(), 1, data)

    assert updated_user.name == "Luiz Otavio"
    assert updated_user.email == "novo@email.com"


@patch("app.services.user.user_repository")
def test_patch_user(repository):
    repository.get_user_by_id.return_value = make_user()
    repository.update_user.return_value = make_user(
        1, "Luiz Otavio", "luiz@email.com"
    )

    updated_user = user.patch_user(
        MagicMock(),
        1,
        UserPatch(name="Luiz Otavio"),
    )

    assert updated_user.name == "Luiz Otavio"
    assert updated_user.email == "luiz@email.com"


@patch("app.services.user.user_repository")
def test_delete_user(repository):
    repository.get_user_by_id.return_value = make_user()

    result = user.delete_user(MagicMock(), 1)

    assert result == {"message": "Usuário removido com sucesso"}
    repository.delete_user.assert_called_once()


@patch("app.services.user.user_repository")
def test_get_user_not_found(repository):
    repository.get_user_by_id.return_value = None

    with pytest.raises(HTTPException) as exc:
        user.get_user(MagicMock(), 999)

    assert exc.value.status_code == 404
