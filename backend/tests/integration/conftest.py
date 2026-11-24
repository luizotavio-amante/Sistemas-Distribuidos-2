import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core import security
from app.database.base import Base
from app.database.session import get_db
from app.main import app

TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://stockflow:stockflow@localhost:5433/stockflow_test",
)

engine = create_engine(TEST_DATABASE_URL)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


@pytest.fixture
def anonymous_client(monkeypatch):
    monkeypatch.setattr(
        security,
        "SECRET_KEY",
        "stockflow-test-secret-key-only-for-automated-tests",
    )

    if engine.url.database != "stockflow_test":
        raise RuntimeError("Banco de testes inválido")

    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()

        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    try:
        with TestClient(app) as test_client:
            yield test_client

    finally:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(anonymous_client):
    response = anonymous_client.post(
        "/auth/register",
        json={
            "name": "Usuário Teste",
            "email": "teste@stockflow.com",
            "password": "Teste12345",
        },
    )

    assert response.status_code == 201

    response = anonymous_client.post(
        "/auth/login",
        json={
            "email": "teste@stockflow.com",
            "password": "Teste12345",
        },
    )

    assert response.status_code == 200

    token = response.json()["access_token"]

    anonymous_client.headers.update({"Authorization": f"Bearer {token}"})

    return anonymous_client
