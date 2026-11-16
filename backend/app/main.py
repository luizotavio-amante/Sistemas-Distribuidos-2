
from fastapi import FastAPI

app = FastAPI(
    title="StockFlow API",
    description="Sistema de Controle de Estoque e Vendas",
    version="1.0.0",
)


@app.get("/")
def root():
    return {"message": "StockFlow API funcionando!"}
