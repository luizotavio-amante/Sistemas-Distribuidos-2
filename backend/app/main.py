from fastapi import FastAPI

from app.api.routes.users import router as users_router

app = FastAPI()

app.include_router(
    users_router,
    prefix="/users",
    tags=["users"],
)


@app.get("/")
def root():
    return {"message": "API funcionando"}
