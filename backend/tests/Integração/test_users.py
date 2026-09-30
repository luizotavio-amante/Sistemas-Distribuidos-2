from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_get_users():
    response = client.get("/users/")

    assert response.status_code == 200


def test_get_user():
    # Primeiro cria um usuário
    response = client.post(
        "/users/",
        json={
            "name": "Luiz",
            "email": "luiz@email.com",
        },
    )

    user_id = response.json()["id"]

    # Depois busca o usuário
    response = client.get(f"/users/{user_id}")

    assert response.status_code == 200
    assert response.json()["name"] == "Luiz"


def test_post_user():
    response = client.post(
        "/users/",
        json={
            "name": "João",
            "email": "joao@email.com",
        },
    )

    assert response.status_code == 201
    assert response.json()["name"] == "João"
    assert response.json()["email"] == "joao@email.com"


def test_put_user():
    # Cria usuário
    response = client.post(
        "/users/",
        json={
            "name": "Maria",
            "email": "maria@email.com",
        },
    )

    user_id = response.json()["id"]

    # Atualiza usuário
    response = client.put(
        f"/users/{user_id}",
        json={
            "name": "Maria Silva",
            "email": "maria.silva@email.com",
        },
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Maria Silva"


def test_patch_user():
    # Cria usuário
    response = client.post(
        "/users/",
        json={
            "name": "Pedro",
            "email": "pedro@email.com",
        },
    )

    user_id = response.json()["id"]

    # Altera somente o nome
    response = client.patch(
        f"/users/{user_id}",
        json={
            "name": "Pedro Silva",
        },
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Pedro Silva"
    assert response.json()["email"] == "pedro@email.com"


def test_delete_user():
    # Cria usuário
    response = client.post(
        "/users/",
        json={
            "name": "Carlos",
            "email": "carlos@email.com",
        },
    )

    user_id = response.json()["id"]

    # Exclui usuário
    response = client.delete(f"/users/{user_id}")

    assert response.status_code == 200

    # Confirma que foi excluído
    response = client.get(f"/users/{user_id}")

    assert response.status_code == 404