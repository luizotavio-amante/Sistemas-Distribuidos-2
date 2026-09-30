from app.schemas.user import User, UserCreate, UserPatch

users: list[User] = []


def get_users() -> list[User]:
    return users


def get_user(user_id: int) -> User | None:
    for user in users:
        if user.id == user_id:
            return user

    return None


def create_user(user: UserCreate) -> User:
    new_id = len(users) + 1

    new_user = User(
        id=new_id,
        name=user.name,
        email=user.email,
    )

    users.append(new_user)

    return new_user


def update_user(user_id: int, name: str, email: str) -> User | None:
    user = get_user(user_id)

    if user is None:
        return None

    user.name = name
    user.email = email

    return user


def patch_user(user_id: int, data: UserPatch) -> User | None:
    user = get_user(user_id)

    if user is None:
        return None

    if data.name is not None:
        user.name = data.name

    if data.email is not None:
        user.email = data.email

    return user


def delete_user(user_id: int) -> bool:
    user = get_user(user_id)

    if user is None:
        return False

    users.remove(user)

    return True
