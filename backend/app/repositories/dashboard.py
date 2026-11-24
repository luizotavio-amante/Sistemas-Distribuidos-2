from datetime import datetime
from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.sale import Sale


class DashboardRepository:
    def __init__(self, db: Session):
        self.db = db

    def count_products(self) -> int:
        statement = select(func.count(Product.id))
        return self.db.scalar(statement) or 0

    def total_stock(self) -> int:
        statement = select(func.sum(Product.quantity))
        return self.db.scalar(statement) or 0

    def count_low_stock_products(self) -> int:
        statement = select(func.count(Product.id)).where(
            Product.quantity <= Product.minimum_stock
        )

        return self.db.scalar(statement) or 0

    def count_sales(self) -> int:
        statement = select(func.count(Sale.id))
        return self.db.scalar(statement) or 0

    def total_revenue(self) -> Decimal:
        statement = select(func.sum(Sale.total))
        return self.db.scalar(statement) or Decimal("0.00")

    def daily_revenue(
        self,
        start: datetime,
        end: datetime,
    ) -> Decimal:
        statement = select(func.sum(Sale.total)).where(
            Sale.created_at >= start,
            Sale.created_at < end,
        )

        return self.db.scalar(statement) or Decimal("0.00")
