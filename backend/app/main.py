import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.items import router as items_router
from app.api.routes.users import router as users_router

app = FastAPI()

# Origens permitidas para acessar a API
cors_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

# Rotas de usuários - Prática 5
app.include_router(users_router)

# Rotas de itens - Prática 7
app.include_router(
    items_router,
    prefix="/items",
    tags=["items"],
)


@app.get("/")
def root():
    return {"message": "API funcionando"}
