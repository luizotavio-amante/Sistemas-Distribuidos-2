
from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def unique_email():
    return f"teste-{uuid4().hex}@email.com"


def create_test_user(name):
    response = client.post(
        "/users/",
        json={
            "name": name,
            "email": unique_email(),
        },
    )

    assert response.status_code == 201
    return response.json()


def test_get_users():
    response = client.get("/users/")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_user():
    created_user = create_test_user("Luiz")

    response = client.get(f"/users/{created_user['id']}")

    assert response.status_code == 200
    assert response.json()["id"] == created_user["id"]
    assert response.json()["name"] == "Luiz"


def test_post_user():
    email = unique_email()

    response = client.post(
        "/users/",
        json={
            "name": "João",
            "email": email,
        },
    )

    assert response.status_code == 201
    assert response.json()["name"] == "João"
    assert response.json()["email"] == email


def test_put_user():
    created_user = create_test_user("Maria")
    new_email = unique_email()

    response = client.put(
        f"/users/{created_user['id']}",
        json={
            "name": "Maria Silva",
            "email": new_email,
        },
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Maria Silva"
    assert response.json()["email"] == new_email


def test_patch_user():
    created_user = create_test_user("Pedro")

    response = client.patch(
        f"/users/{created_user['id']}",
        json={
            "name": "Pedro Silva",
        },
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Pedro Silva"
    assert response.json()["email"] == created_user["email"]


def test_delete_user():
    created_user = create_test_user("Carlos")

    response = client.delete(f"/users/{created_user['id']}")

    assert response.status_code == 200

    response = client.get(f"/users/{created_user['id']}")

    assert response.status_code == 404
