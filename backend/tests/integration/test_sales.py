from concurrent.futures import ThreadPoolExecutor
from decimal import Decimal


def create_product(client, name="Coxinha", quantity=20):
    response = client.post(
        "/products",
        json={
            "name": name,
            "price": "7.50",
            "quantity": quantity,
            "minimum_stock": 5,
        },
    )

    assert response.status_code == 201

    return response.json()["id"]


def test_create_sale(client):
    product_id = create_product(client)

    response = client.post(
        "/sales",
        json={"items": [{"product_id": product_id, "quantity": 3}]},
    )

    assert response.status_code == 201
    assert Decimal(response.json()["total"]) == Decimal("22.50")
    assert response.json()["items"][0]["quantity"] == 3


def test_sale_reduces_stock(client):
    product_id = create_product(client)

    response = client.post(
        "/sales",
        json={"items": [{"product_id": product_id, "quantity": 3}]},
    )

    assert response.status_code == 201

    product = client.get(f"/products/{product_id}")

    assert product.json()["quantity"] == 17


def test_insufficient_stock(client):
    product_id = create_product(client, quantity=5)

    response = client.post(
        "/sales",
        json={"items": [{"product_id": product_id, "quantity": 10}]},
    )

    assert response.status_code == 409

    product = client.get(f"/products/{product_id}")

    assert product.json()["quantity"] == 5
    assert client.get("/sales").json() == []


def test_sale_product_not_found(client):
    response = client.post(
        "/sales",
        json={"items": [{"product_id": 999999, "quantity": 1}]},
    )

    assert response.status_code == 404


def test_list_sales(client):
    product_id = create_product(client)

    created = client.post(
        "/sales",
        json={"items": [{"product_id": product_id, "quantity": 2}]},
    )

    assert created.status_code == 201

    response = client.get("/sales")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert Decimal(response.json()[0]["total"]) == Decimal("15.00")


def test_get_sale(client):
    product_id = create_product(client)

    created = client.post(
        "/sales",
        json={"items": [{"product_id": product_id, "quantity": 2}]},
    )

    assert created.status_code == 201

    sale_id = created.json()["id"]

    response = client.get(f"/sales/{sale_id}")

    assert response.status_code == 200
    assert response.json()["id"] == sale_id


def test_sale_not_found(client):
    response = client.get("/sales/999999")

    assert response.status_code == 404


def test_empty_sale(client):
    response = client.post(
        "/sales",
        json={"items": []},
    )

    assert response.status_code == 422


def test_invalid_sale_quantity(client):
    product_id = create_product(client)

    response = client.post(
        "/sales",
        json={"items": [{"product_id": product_id, "quantity": 0}]},
    )

    assert response.status_code == 422


def test_sale_with_multiple_products(client):
    first_id = create_product(client, name="Coxinha")
    second_id = create_product(client, name="Pastel")

    response = client.post(
        "/sales",
        json={
            "items": [
                {"product_id": first_id, "quantity": 2},
                {"product_id": second_id, "quantity": 3},
            ]
        },
    )

    assert response.status_code == 201
    assert Decimal(response.json()["total"]) == Decimal("37.50")
    assert len(response.json()["items"]) == 2

    assert client.get(f"/products/{first_id}").json()["quantity"] == 18
    assert client.get(f"/products/{second_id}").json()["quantity"] == 17


def test_sale_rollback(client):
    first_id = create_product(client, name="Coxinha", quantity=20)
    second_id = create_product(client, name="Pastel", quantity=2)

    response = client.post(
        "/sales",
        json={
            "items": [
                {"product_id": first_id, "quantity": 5},
                {"product_id": second_id, "quantity": 10},
            ]
        },
    )

    assert response.status_code == 409

    assert client.get(f"/products/{first_id}").json()["quantity"] == 20
    assert client.get(f"/products/{second_id}").json()["quantity"] == 2

    assert client.get("/sales").json() == []


def test_sale_with_repeated_product(client):
    product_id = create_product(client)

    response = client.post(
        "/sales",
        json={
            "items": [
                {"product_id": product_id, "quantity": 2},
                {"product_id": product_id, "quantity": 3},
            ]
        },
    )

    assert response.status_code == 201
    assert len(response.json()["items"]) == 1
    assert response.json()["items"][0]["quantity"] == 5
    assert Decimal(response.json()["total"]) == Decimal("37.50")

    assert client.get(f"/products/{product_id}").json()["quantity"] == 15


def test_cannot_delete_product_with_sales(client):
    product_id = create_product(client)

    sale = client.post(
        "/sales",
        json={"items": [{"product_id": product_id, "quantity": 2}]},
    )

    assert sale.status_code == 201

    response = client.delete(f"/products/{product_id}")

    assert response.status_code == 409
    assert client.get(f"/products/{product_id}").status_code == 200
    assert len(client.get("/sales").json()) == 1


def test_concurrent_sales(client):
    product_id = create_product(client, quantity=5)

    def register_sale():
        return client.post(
            "/sales",
            json={"items": [{"product_id": product_id, "quantity": 4}]},
        )

    with ThreadPoolExecutor(max_workers=2) as executor:
        first = executor.submit(register_sale)
        second = executor.submit(register_sale)

        responses = [first.result(), second.result()]

    status_codes = sorted(response.status_code for response in responses)

    assert status_codes == [201, 409]

    product = client.get(f"/products/{product_id}")

    assert product.json()["quantity"] == 1
    assert len(client.get("/sales").json()) == 1
