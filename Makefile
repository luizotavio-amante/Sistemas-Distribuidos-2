
.PHONY: help install test lint format run up up-build down build logs logs-api ps shell clean db-upgrade db-current frontend-install frontend-dev frontend-lint frontend-format frontend-check frontend-test frontend-test-e2e frontend-build check-all e2e

# ==========================
# Variaveis
# ==========================

POETRY := poetry -C backend
PYTEST := $(POETRY) run python -m pytest
RUFF := $(POETRY) run ruff
UVICORN := $(POETRY) run uvicorn
NPM := npm --prefix frontend

# ==========================
# Ajuda
# ==========================

help:
	@echo "Comandos disponiveis:"
	@echo ""
	@echo "BACKEND:"
	@echo "  make install           - instala as dependencias do backend"
	@echo "  make test              - executa os testes do backend"
	@echo "  make lint              - verifica o codigo com Ruff"
	@echo "  make format            - formata o codigo com Ruff"
	@echo "  make run               - inicia o backend localmente"
	@echo ""
	@echo "BANCO DE DADOS:"
	@echo "  make db-upgrade        - aplica as migrations do Alembic"
	@echo "  make db-current        - mostra a migration atual do banco"
	@echo ""
	@echo "DOCKER:"
	@echo "  make up                - sobe os containers"
	@echo "  make up-build          - reconstroi as imagens e sobe os containers"
	@echo "  make down              - para e remove os containers"
	@echo "  make build             - constroi as imagens"
	@echo "  make logs              - acompanha os logs"
	@echo "  make logs-api          - acompanha apenas os logs da API"
	@echo "  make ps                - mostra o status dos servicos"
	@echo "  make shell             - abre um shell no container da API"
	@echo "  make clean             - remove containers, rede e volumes do Compose"
	@echo ""
	@echo "FRONTEND:"
	@echo "  make frontend-install  - instala as dependencias do frontend"
	@echo "  make frontend-dev      - inicia o frontend com Vite"
	@echo "  make frontend-lint     - verifica o codigo com Biome"
	@echo "  make frontend-format   - formata o codigo com Biome"
	@echo "  make frontend-check    - verifica lint e formatacao com Biome"
	@echo "  make frontend-test     - executa testes unitarios e de integracao"
	@echo "  make frontend-test-e2e - executa testes E2E com Playwright"
	@echo "  make frontend-build    - gera o build de producao"
	@echo ""
	@echo "TESTES E2E ISOLADOS:"
	@echo "  make e2e               - executa os testes e limpa os containers lab-e2e"
	@echo ""
	@echo "GERAL:"
	@echo "  make check-all         - executa verificacoes do backend e frontend"

# ==========================
# Backend
# ==========================

install:
	$(POETRY) install

test:
	$(PYTEST)

lint:
	$(RUFF) check .

format:
	$(RUFF) format .

run:
	$(UVICORN) app.main:app --reload

# ==========================
# Banco de dados - Alembic
# ==========================

db-upgrade:
	docker compose exec -T api poetry run alembic upgrade head

db-current:
	docker compose exec -T api poetry run alembic current

# ==========================
# Docker
# ==========================

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

# ==========================
# Frontend - Pratica 6
# ==========================

frontend-install:
	$(NPM) ci

frontend-dev:
	$(NPM) run dev

frontend-lint:
	$(NPM) run lint

frontend-format:
	$(NPM) run format

frontend-check:
	$(NPM) run check

frontend-test:
	$(NPM) run test

frontend-test-e2e:
	$(NPM) run test:e2e

frontend-build:
	$(NPM) run build

# ==========================
# Verificacoes gerais
# ==========================

check-all: lint test frontend-check frontend-test frontend-build frontend-test-e2e

# ==========================
# Testes E2E isolados
# ==========================

e2e:
	powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/e2e.ps1
