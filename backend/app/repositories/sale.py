from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.sale import Sale
from app.models.sale_item import SaleItem


class SaleRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[Sale]:
        statement = select(Sale).order_by(Sale.id.desc())
        return list(self.db.scalars(statement).all())

    def get_by_id(self, sale_id: int) -> Sale | None:
        return self.db.get(Sale, sale_id)

    def get_items(self, sale_id: int) -> list[SaleItem]:
        statement = (
            select(SaleItem).where(SaleItem.sale_id == sale_id).order_by(SaleItem.id)
        )

        return list(self.db.scalars(statement).all())

    def get_product_for_update(self, product_id: int) -> Product | None:
        statement = select(Product).where(Product.id == product_id).with_for_update()

        return self.db.scalar(statement)

    def create_sale(self, total: Decimal) -> Sale:
        sale = Sale(total=total)

        self.db.add(sale)
        self.db.flush()

        return sale

    def create_item(
        self,
        sale_id: int,
        product_id: int,
        quantity: int,
        unit_price: Decimal,
        subtotal: Decimal,
    ) -> SaleItem:
        item = SaleItem(
            sale_id=sale_id,
            product_id=product_id,
            quantity=quantity,
            unit_price=unit_price,
            subtotal=subtotal,
        )

        self.db.add(item)

        return item
