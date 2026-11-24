from datetime import UTC, datetime, timedelta

import jwt
import pytest

from app.core import security
from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


@pytest.fixture(autouse=True)
def configure_secret_key(monkeypatch):
    monkeypatch.setattr(
        security,
        "SECRET_KEY",
        "stockflow-test-secret-key-only-for-automated-tests",
    )


def test_hash_password():
    password = "StockFlow123"

    hashed_password = hash_password(password)

    assert hashed_password != password
    assert hashed_password.startswith("$argon2id$")


def test_verify_correct_password():
    password = "StockFlow123"
    hashed_password = hash_password(password)

    assert verify_password(password, hashed_password) is True


def test_verify_wrong_password():
    hashed_password = hash_password("StockFlow123")

    assert verify_password("SenhaErrada", hashed_password) is False


def test_password_hash_is_unique():
    password = "StockFlow123"

    first_hash = hash_password(password)
    second_hash = hash_password(password)

    assert first_hash != second_hash


def test_create_and_decode_access_token():
    token = create_access_token(1)

    assert decode_access_token(token) == 1


def test_invalid_access_token():
    assert decode_access_token("token-invalido") is None


def test_expired_access_token():
    payload = {
        "sub": "1",
        "exp": datetime.now(UTC) - timedelta(minutes=1),
    }

    token = jwt.encode(
        payload,
        security.get_secret_key(),
        algorithm=security.ALGORITHM,
    )

    assert decode_access_token(token) is None


def test_token_with_invalid_signature():
    token = jwt.encode(
        {
            "sub": "1",
            "exp": datetime.now(UTC) + timedelta(minutes=60),
        },
        "outra-chave-secreta-diferente-da-original",
        algorithm=security.ALGORITHM,
    )

    assert decode_access_token(token) is None
