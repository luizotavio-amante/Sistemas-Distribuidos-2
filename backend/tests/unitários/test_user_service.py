from app.schemas.user import UserCreate, UserPatch
from app.services import user


def setup_function():
    user.users.clear()


def test_create_user():
    data = UserCreate(
        name="Luiz",
        email="luiz@email.com",
    )

    new_user = user.create_user(data)

    assert new_user.id == 1
    assert new_user.name == "Luiz"
    assert new_user.email == "luiz@email.com"


def test_get_user():
    data = UserCreate(
        name="Luiz",
        email="luiz@email.com",
    )

    created_user = user.create_user(data)

    found_user = user.get_user(created_user.id)

    assert found_user is not None
    assert found_user.name == "Luiz"


def test_get_users():
    user.create_user(
        UserCreate(
            name="Luiz",
            email="luiz@email.com",
        )
    )

    user.create_user(
        UserCreate(
            name="João",
            email="joao@email.com",
        )
    )

    users = user.get_users()

    assert len(users) == 2


def test_update_user():
    created_user = user.create_user(
        UserCreate(
            name="Luiz",
            email="luiz@email.com",
        )
    )

    updated_user = user.update_user(
        created_user.id,
        "Luiz Otavio",
        "novo@email.com",
    )

    assert updated_user is not None
    assert updated_user.name == "Luiz Otavio"
    assert updated_user.email == "novo@email.com"


def test_patch_user():
    created_user = user.create_user(
        UserCreate(
            name="Luiz",
            email="luiz@email.com",
        )
    )

    updated_user = user.patch_user(
        created_user.id,
        UserPatch(name="Luiz Otavio"),
    )

    assert updated_user is not None
    assert updated_user.name == "Luiz Otavio"
    assert updated_user.email == "luiz@email.com"


def test_delete_user():
    created_user = user.create_user(
        UserCreate(
            name="Luiz",
            email="luiz@email.com",
        )
    )

    result = user.delete_user(created_user.id)

    assert result is True
    assert user.get_user(created_user.id) is None