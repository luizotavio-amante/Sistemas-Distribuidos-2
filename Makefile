# Variáveis
APP_NAME = sistemas-distribuidos
PYTHON = poetry run python
POETRY = poetry
UVICORN = poetry run uvicorn

# Comando padrão
all: help

# Ajuda
help:
	@echo "Comandos disponíveis:"
	@echo "  make install  - Instala as dependências"
	@echo "  make test     - Executa testes"
	@echo "  make lint     - Verifica o código"
	@echo "  make format   - Formata o código"
	@echo "  make run      - Inicia o servidor"
	@echo "  make clean    - Limpa arquivos temporários"
	@echo "  make build    - Cria as imagens Docker"
	@echo "  make up       - Inicia os containers"
	@echo "  make down     - Para os containers"
	@echo "  make logs     - Exibe os logs dos containers"
	@echo "  make ps       - Exibe o status dos containers"

install:
	cd backend && $(POETRY) install

test:
	cd backend && $(POETRY) run pytest

lint:
	cd backend && $(POETRY) run ruff check .

format:
	cd backend && $(POETRY) run ruff format .

run:
	cd backend && $(UVICORN) main:app --reload

clean:
	cd backend && $(PYTHON) -c "import shutil; shutil.rmtree('__pycache__', ignore_errors=True)"

# Docker
build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

ps:
	docker compose ps

.PHONY: all help install test lint format run clean build up down logs ps