
from fastapi import FastAPI

from app.api.routes.products import router as products_router

app = FastAPI(
    title="StockFlow API",
    description="Sistema de Controle de Estoque e Vendas",
    version="1.0.0",
)

app.include_router(products_router)


@app.get("/")
def root():
    return {"message": "StockFlow API funcionando!"}
