from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.sale import SaleCreate, SaleResponse
from app.services.sale import SaleService

router = APIRouter(prefix="/sales", tags=["Sales"])

DbSession = Annotated[Session, Depends(get_db)]


@router.get("", response_model=list[SaleResponse])
def list_sales(db: DbSession):
    service = SaleService(db)
    return service.list_sales()


@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale(sale_id: int, db: DbSession):
    service = SaleService(db)
    return service.get_sale(sale_id)


@router.post(
    "",
    response_model=SaleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_sale(data: SaleCreate, db: DbSession):
    service = SaleService(db)
    return service.create_sale(data)
