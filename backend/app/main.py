import os

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.dependencies import get_current_user
from app.api.routes.auth import router as auth_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.products import router as products_router
from app.api.routes.sales import router as sales_router

app = FastAPI(
    title="StockFlow API",
    description="Sistema de Controle de Estoque e Vendas",
    version="1.0.0",
)

cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
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

app.include_router(
    dashboard_router,
    dependencies=[Depends(get_current_user)],
)


@app.get("/")
def root():
    return {"message": "StockFlow API funcionando!"}
