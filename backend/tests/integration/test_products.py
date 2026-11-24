PRODUCT_DATA = {
    "name": "Coxinha",
    "price": "7.50",
    "quantity": 20,
    "minimum_stock": 5,
}


def test_root(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "StockFlow API funcionando!"}


def test_create_product(client):
    response = client.post("/products", json=PRODUCT_DATA)

    assert response.status_code == 201
    assert response.json()["name"] == "Coxinha"
    assert response.json()["quantity"] == 20


def test_list_products(client):
    client.post("/products", json=PRODUCT_DATA)

    response = client.get("/products")

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "Coxinha"


def test_get_product(client):
    created = client.post("/products", json=PRODUCT_DATA)
    product_id = created.json()["id"]

    response = client.get(f"/products/{product_id}")

    assert response.status_code == 200
    assert response.json()["id"] == product_id


def test_update_product(client):
    created = client.post("/products", json=PRODUCT_DATA)
    product_id = created.json()["id"]

    updated_data = {
        "name": "Coxinha de Frango",
        "price": "8.50",
        "quantity": 30,
        "minimum_stock": 10,
    }

    response = client.put(
        f"/products/{product_id}",
        json=updated_data,
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Coxinha de Frango"
    assert response.json()["quantity"] == 30


def test_delete_product(client):
    created = client.post("/products", json=PRODUCT_DATA)
    product_id = created.json()["id"]

    response = client.delete(f"/products/{product_id}")

    assert response.status_code == 204
    assert client.get(f"/products/{product_id}").status_code == 404


def test_product_not_found(client):
    response = client.get("/products/999")

    assert response.status_code == 404


def test_invalid_price(client):
    data = {**PRODUCT_DATA, "price": "-5.00"}

    response = client.post("/products", json=data)

    assert response.status_code == 422


def test_invalid_quantity(client):
    data = {**PRODUCT_DATA, "quantity": -10}

    response = client.post("/products", json=data)

    assert response.status_code == 422
