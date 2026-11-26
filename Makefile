.PHONY: help install up up-build down restart build ps logs logs-api logs-frontend migrate test test-backend test-frontend lint lint-backend lint-frontend format-backend build-frontend check-all

POETRY := poetry -C backend
PYTEST := $(POETRY) run python -m pytest
RUFF := $(POETRY) run ruff
NPM := npm --prefix frontend

help:
	@echo "StockFlow - Comandos disponiveis:"
	@echo "  make install        - Instala as dependencias"
	@echo "  make up             - Inicia os containers"
	@echo "  make up-build       - Reconstrui e inicia os containers"
	@echo "  make down           - Encerra os containers"
	@echo "  make restart        - Reinicia os containers"
	@echo "  make build          - Constroi as imagens Docker"
	@echo "  make ps             - Exibe o status dos containers"
	@echo "  make logs           - Exibe os logs do sistema"
	@echo "  make logs-api       - Exibe os logs do backend"
	@echo "  make logs-frontend  - Exibe os logs do frontend"
	@echo "  make migrate        - Executa as migrations"
	@echo "  make test           - Executa os testes disponiveis"
	@echo "  make test-backend   - Executa os testes do backend"
	@echo "  make test-frontend  - Executa os testes do frontend"
	@echo "  make lint           - Valida o backend e o frontend"
	@echo "  make format-backend - Formata o backend"
	@echo "  make build-frontend - Gera o build do frontend"
	@echo "  make check-all      - Executa todas as validacoes"

install:
	$(POETRY) install --no-root
	$(NPM) ci

up:
	docker compose up -d

up-build:
	docker compose up -d --build

down:
	docker compose down

restart:
	docker compose restart

build:
	docker compose build

ps:
	docker compose ps

logs:
	docker compose logs -f

logs-api:
	docker compose logs -f api

logs-frontend:
	docker compose logs -f frontend

migrate:
	docker compose exec api alembic upgrade head

test-backend:
	$(PYTEST) tests -v

test-frontend:
	$(NPM) run test

test: test-backend test-frontend

lint-backend:
	$(RUFF) check .
	$(RUFF) format --check .

lint-frontend:
	$(NPM) run lint

lint: lint-backend lint-frontend

format-backend:
	$(RUFF) check . --fix
	$(RUFF) format .

build-frontend:
	$(NPM) run build

check-all: lint test build-frontend