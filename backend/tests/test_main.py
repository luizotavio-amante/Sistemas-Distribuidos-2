import pytest

from app.main import somar, subtrair, multiplicar, dividir, eh_par


@pytest.fixture
def numeros():
    return {
        "a": 10,
        "b": 2,
    }


@pytest.mark.parametrize(
    "a, b, resultado",
    [
        (2, 3, 5),
        (10, 5, 15),
        (-2, 2, 0),
        (0, 10, 10),
    ],
)
def test_somar(a, b, resultado):
    assert somar(a, b) == resultado


def test_subtrair():
    assert subtrair(10, 4) == 6


def test_multiplicar():
    assert multiplicar(3, 4) == 12


def test_dividir(numeros):
    assert dividir(numeros["a"], numeros["b"]) == 5


def test_eh_par():
    assert eh_par(4) is True


def test_divisao_por_zero():
    with pytest.raises(ValueError):
        dividir(10, 0)