from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.sale_item import SaleItem
from app.schemas.product import ProductCreate, ProductUpdate


class ProductRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[Product]:
        statement = select(Product).order_by(Product.id)
        return list(self.db.scalars(statement).all())

    def get_by_id(self, product_id: int) -> Product | None:
        return self.db.get(Product, product_id)

    def create(self, data: ProductCreate) -> Product:
        product = Product(**data.model_dump())

        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)

        return product

    def update(
        self,
        product: Product,
        data: ProductUpdate,
    ) -> Product:
        for field, value in data.model_dump().items():
            setattr(product, field, value)

        self.db.commit()
        self.db.refresh(product)

        return product

    def delete(self, product: Product) -> None:
        self.db.delete(product)
        self.db.commit()

    def has_sales(self, product_id: int) -> bool:
        statement = (
            select(SaleItem.id).where(SaleItem.product_id == product_id).limit(1)
        )

        return self.db.scalar(statement) is not None
