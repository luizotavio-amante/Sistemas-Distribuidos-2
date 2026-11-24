from decimal import Decimal


def test_empty_dashboard(client):
    response = client.get("/dashboard")

    assert response.status_code == 200

    data = response.json()

    assert data["total_products"] == 0
    assert data["total_stock"] == 0
    assert data["low_stock_products"] == 0
    assert data["total_sales"] == 0
    assert Decimal(data["total_revenue"]) == Decimal("0.00")
    assert Decimal(data["daily_revenue"]) == Decimal("0.00")


def test_dashboard_with_products(client):
    first = client.post(
        "/products",
        json={
            "name": "Coxinha",
            "price": "7.50",
            "quantity": 20,
            "minimum_stock": 5,
        },
    )

    second = client.post(
        "/products",
        json={
            "name": "Pastel",
            "price": "8.00",
            "quantity": 3,
            "minimum_stock": 5,
        },
    )

    assert first.status_code == 201
    assert second.status_code == 201

    response = client.get("/dashboard")

    assert response.status_code == 200

    data = response.json()

    assert data["total_products"] == 2
    assert data["total_stock"] == 23
    assert data["low_stock_products"] == 1


def test_dashboard_with_sales(client):
    product = client.post(
        "/products",
        json={
            "name": "Coxinha",
            "price": "7.50",
            "quantity": 20,
            "minimum_stock": 5,
        },
    )

    assert product.status_code == 201

    product_id = product.json()["id"]

    sale = client.post(
        "/sales",
        json={
            "items": [
                {
                    "product_id": product_id,
                    "quantity": 3,
                }
            ]
        },
    )

    assert sale.status_code == 201

    response = client.get("/dashboard")

    assert response.status_code == 200

    data = response.json()

    assert data["total_products"] == 1
    assert data["total_stock"] == 17
    assert data["total_sales"] == 1
    assert Decimal(data["total_revenue"]) == Decimal("22.50")
    assert Decimal(data["daily_revenue"]) == Decimal("22.50")


def test_dashboard_without_authentication(anonymous_client):
    response = anonymous_client.get("/dashboard")

    assert response.status_code == 401
