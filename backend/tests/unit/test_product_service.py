from decimal import Decimal
from unittest.mock import Mock

import pytest
from fastapi import HTTPException

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from app.services.product import ProductService


@pytest.fixture
def service():
    service = ProductService(Mock())
    service.repository = Mock()
    return service


@pytest.fixture
def product():
    return Product(
        id=1,
        name="Coxinha",
        price=Decimal("7.50"),
        quantity=20,
        minimum_stock=5,
    )


def test_list_products(service, product):
    service.repository.get_all.return_value = [product]

    result = service.list_products()

    assert len(result) == 1
    assert result[0].name == "Coxinha"


def test_get_product(service, product):
    service.repository.get_by_id.return_value = product

    result = service.get_product(1)

    assert result.id == 1
    assert result.name == "Coxinha"


def test_get_product_not_found(service):
    service.repository.get_by_id.return_value = None

    with pytest.raises(HTTPException) as error:
        service.get_product(999)

    assert error.value.status_code == 404


def test_create_product(service, product):
    data = ProductCreate(
        name="Coxinha",
        price=Decimal("7.50"),
        quantity=20,
        minimum_stock=5,
    )

    service.repository.create.return_value = product

    result = service.create_product(data)

    assert result.name == "Coxinha"
    assert result.quantity == 20
    service.repository.create.assert_called_once_with(data)


def test_update_product(service, product):
    data = ProductUpdate(
        name="Coxinha de Frango",
        price=Decimal("8.50"),
        quantity=30,
        minimum_stock=10,
    )

    updated_product = Product(id=1, **data.model_dump())

    service.repository.get_by_id.return_value = product
    service.repository.update.return_value = updated_product

    result = service.update_product(1, data)

    assert result.name == "Coxinha de Frango"
    assert result.quantity == 30
    service.repository.update.assert_called_once_with(product, data)


def test_delete_product(service, product):
    service.repository.get_by_id.return_value = product
    service.repository.has_sales.return_value = False

    service.delete_product(1)

    service.repository.delete.assert_called_once_with(product)


def test_delete_product_with_sales(service, product):
    service.repository.get_by_id.return_value = product
    service.repository.has_sales.return_value = True

    with pytest.raises(HTTPException) as error:
        service.delete_product(1)

    assert error.value.status_code == 409
    service.repository.delete.assert_not_called()
