from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.product import Product
from app.repositories.product import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate


class ProductService:
    def __init__(self, db: Session):
        self.repository = ProductRepository(db)

    def list_products(self) -> list[Product]:
        return self.repository.get_all()

    def get_product(self, product_id: int) -> Product:
        product = self.repository.get_by_id(product_id)

        if product is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Produto não encontrado",
            )

        return product

    def create_product(self, data: ProductCreate) -> Product:
        return self.repository.create(data)

    def update_product(
        self,
        product_id: int,
        data: ProductUpdate,
    ) -> Product:
        product = self.get_product(product_id)
        return self.repository.update(product, data)

    def delete_product(self, product_id: int) -> None:
        product = self.get_product(product_id)
        self.repository.delete(product)
