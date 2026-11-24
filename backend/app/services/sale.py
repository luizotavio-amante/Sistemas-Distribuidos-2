from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.sale import SaleRepository
from app.schemas.sale import SaleCreate, SaleResponse


class SaleService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = SaleRepository(db)

    def list_sales(self) -> list[SaleResponse]:
        sales = self.repository.get_all()

        return [self.get_sale(sale.id) for sale in sales]

    def get_sale(self, sale_id: int) -> SaleResponse:
        sale = self.repository.get_by_id(sale_id)

        if sale is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Venda não encontrada",
            )

        items = self.repository.get_items(sale.id)

        return SaleResponse(
            id=sale.id,
            created_at=sale.created_at,
            total=sale.total,
            items=items,
        )

    def create_sale(self, data: SaleCreate) -> SaleResponse:
        try:
            quantities: dict[int, int] = {}

            for item in data.items:
                quantities[item.product_id] = (
                    quantities.get(item.product_id, 0) + item.quantity
                )

            total = Decimal("0.00")
            sale_items = []

            for product_id in sorted(quantities):
                quantity = quantities[product_id]

                product = self.repository.get_product_for_update(product_id)

                if product is None:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Produto {product_id} não encontrado",
                    )

                if product.quantity < quantity:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=(
                            f"Estoque insuficiente para {product.name}. "
                            f"Disponível: {product.quantity}"
                        ),
                    )

                subtotal = product.price * quantity
                total += subtotal

                product.quantity -= quantity

                sale_items.append(
                    {
                        "product_id": product.id,
                        "quantity": quantity,
                        "unit_price": product.price,
                        "subtotal": subtotal,
                    }
                )

            sale = self.repository.create_sale(total)

            for item in sale_items:
                self.repository.create_item(
                    sale_id=sale.id,
                    **item,
                )

            self.db.flush()

            response = self.get_sale(sale.id)

            self.db.commit()

            return response

        except Exception:
            self.db.rollback()
            raise
