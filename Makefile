
.PHONY: help install test lint format migrate run up up-build down build logs logs-api ps shell clean

POETRY := poetry -C backend
PYTEST := $(POETRY) run python -m pytest
RUFF := $(POETRY) run ruff
ALEMBIC := $(POETRY) run alembic

help:
	@echo "Comandos disponiveis:"
	@echo "  make install  - instala as dependencias do backend"
	@echo "  make test     - executa os testes"
	@echo "  make lint     - verifica o codigo e a formatacao"
	@echo "  make format   - corrige e formata o codigo"
	@echo "  make migrate  - aplica as migrations do Alembic"
	@echo "  make run      - inicia o backend localmente"
	@echo "  make up       - sobe os containers"
	@echo "  make up-build - reconstroi a imagem e sobe os containers"
	@echo "  make down     - para e remove os containers"
	@echo "  make build    - constroi as imagens"
	@echo "  make logs     - acompanha os logs"
	@echo "  make logs-api - acompanha apenas os logs da API"
	@echo "  make ps       - mostra o status dos servicos"
	@echo "  make shell    - abre um shell no container da API"
	@echo "  make clean    - remove containers, rede e volumes do Compose"

install:
	$(POETRY) install --no-root

test:
	$(PYTEST) -v

lint:
	$(RUFF) check app tests
	$(RUFF) format --check app tests

format:
	$(RUFF) check app tests --fix
	$(RUFF) format app tests

migrate:
	cd backend && poetry run alembic upgrade head

run:
	cd backend && poetry run uvicorn app.main:app --reload

up:
	docker compose up -d

up-build:
	docker compose up -d --build

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

logs-api:
	docker compose logs -f api

ps:
	docker compose ps

shell:
	docker compose exec api sh

clean:
	docker compose down -v
