from fastapi import Depends, FastAPI

from app.api.dependencies import get_current_user
from app.api.routes.auth import router as auth_router
from app.api.routes.products import router as products_router
from app.api.routes.sales import router as sales_router

app = FastAPI(
    title="StockFlow API",
    description="Sistema de Controle de Estoque e Vendas",
    version="1.0.0",
)

app.include_router(auth_router)

app.include_router(
    products_router,
    dependencies=[Depends(get_current_user)],
)

app.include_router(
    sales_router,
    dependencies=[Depends(get_current_user)],
)


@app.get("/")
def root():
    return {"message": "StockFlow API funcionando!"}
