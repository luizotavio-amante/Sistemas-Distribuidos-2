from uuid import uuid4

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def novo_usuario(nome):
    return {
        "name": nome,
        "email": f"{uuid4().hex}@teste.com",
    }


def test_get_users():
    response = client.get("/users/")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_user():
    dados = novo_usuario("Luiz")
    response = client.post("/users/", json=dados)

    assert response.status_code == 201
    user_id = response.json()["id"]

    response = client.get(f"/users/{user_id}")

    assert response.status_code == 200
    assert response.json()["name"] == "Luiz"
    assert response.json()["email"] == dados["email"]


def test_post_user():
    dados = novo_usuario("Joao")

    response = client.post("/users/", json=dados)

    assert response.status_code == 201
    assert response.json()["name"] == "Joao"
    assert response.json()["email"] == dados["email"]
    assert "id" in response.json()


def test_put_user():
    dados = novo_usuario("Maria")
    response = client.post("/users/", json=dados)

    assert response.status_code == 201
    user_id = response.json()["id"]

    novos_dados = novo_usuario("Maria Silva")
    response = client.put(
        f"/users/{user_id}",
        json=novos_dados,
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Maria Silva"
    assert response.json()["email"] == novos_dados["email"]


def test_patch_user():
    dados = novo_usuario("Pedro")
    response = client.post("/users/", json=dados)

    assert response.status_code == 201
    user_id = response.json()["id"]

    response = client.patch(
        f"/users/{user_id}",
        json={"name": "Pedro Silva"},
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Pedro Silva"
    assert response.json()["email"] == dados["email"]


def test_delete_user():
    dados = novo_usuario("Carlos")
    response = client.post("/users/", json=dados)

    assert response.status_code == 201
    user_id = response.json()["id"]

    response = client.delete(f"/users/{user_id}")

    assert response.status_code in (200, 204)

    response = client.get(f"/users/{user_id}")

    assert response.status_code == 404


def test_email_duplicado():
    dados = novo_usuario("Ana")

    response = client.post("/users/", json=dados)
    assert response.status_code == 201

    response = client.post("/users/", json=dados)

    assert response.status_code == 409


def test_usuario_inexistente():
    response = client.get("/users/999999999")

    assert response.status_code == 404
