def register_user(client):
    return client.post(
        "/auth/register",
        json={
            "name": "Administrador",
            "email": "admin@stockflow.com",
            "password": "StockFlow123",
        },
    )


def test_register_user(anonymous_client):
    response = register_user(anonymous_client)

    assert response.status_code == 201

    data = response.json()

    assert data["name"] == "Administrador"
    assert data["email"] == "admin@stockflow.com"
    assert "id" in data
    assert "password" not in data
    assert "password_hash" not in data


def test_register_duplicate_email(anonymous_client):
    first = register_user(anonymous_client)

    assert first.status_code == 201

    response = register_user(anonymous_client)

    assert response.status_code == 409


def test_register_invalid_email(anonymous_client):
    response = anonymous_client.post(
        "/auth/register",
        json={
            "name": "Administrador",
            "email": "email-invalido",
            "password": "StockFlow123",
        },
    )

    assert response.status_code == 422


def test_register_invalid_password(anonymous_client):
    response = anonymous_client.post(
        "/auth/register",
        json={
            "name": "Administrador",
            "email": "admin@stockflow.com",
            "password": "123",
        },
    )

    assert response.status_code == 422


def test_login_success(anonymous_client):
    assert register_user(anonymous_client).status_code == 201

    response = anonymous_client.post(
        "/auth/login",
        json={
            "email": "admin@stockflow.com",
            "password": "StockFlow123",
        },
    )

    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"


def test_login_wrong_password(anonymous_client):
    assert register_user(anonymous_client).status_code == 201

    response = anonymous_client.post(
        "/auth/login",
        json={
            "email": "admin@stockflow.com",
            "password": "SenhaErrada123",
        },
    )

    assert response.status_code == 401


def test_login_user_not_found(anonymous_client):
    response = anonymous_client.post(
        "/auth/login",
        json={
            "email": "inexistente@stockflow.com",
            "password": "StockFlow123",
        },
    )

    assert response.status_code == 401


def test_get_current_user(client):
    response = client.get("/auth/me")

    assert response.status_code == 200
    assert response.json()["email"] == "teste@stockflow.com"
    assert "password_hash" not in response.json()


def test_get_current_user_without_token(anonymous_client):
    response = anonymous_client.get("/auth/me")

    assert response.status_code == 401


def test_invalid_token(anonymous_client):
    response = anonymous_client.get(
        "/auth/me",
        headers={"Authorization": "Bearer token-invalido"},
    )

    assert response.status_code == 401


def test_products_without_authentication(anonymous_client):
    response = anonymous_client.get("/products")

    assert response.status_code == 401


def test_sales_without_authentication(anonymous_client):
    response = anonymous_client.get("/sales")

    assert response.status_code == 401


def test_products_with_authentication(client):
    response = client.get("/products")

    assert response.status_code == 200


def test_sales_with_authentication(client):
    response = client.get("/sales")

    assert response.status_code == 200
