# Execução dos Testes

Este projeto utiliza o **Pytest** para execução dos testes automatizados do backend.

## Pré-requisitos

É necessário ter instalado:

* Python 3.12
* Poetry

## Instalação das dependências

Na raiz do projeto, execute:

```bash
poetry -C backend install
```

Esse comando instala as dependências definidas no `pyproject.toml` do backend.

## Executando os testes

Para executar todos os testes, utilize:

```bash
poetry -C backend run python -m pytest
```

Também é possível executar os testes utilizando o Makefile:

```bash
make test
```

O comando deve ser executado a partir da **raiz do projeto**.

## Estrutura dos testes

Os testes estão localizados no diretório:

```text
backend/
└── tests/
    └── test_main.py
```

O arquivo `test_main.py` contém os testes das funções implementadas no backend, como:

* Soma
* Subtração
* Multiplicação
* Divisão
* Verificação de número par
* Tratamento de divisão por zero

## Resultado esperado

Após executar os testes, o Pytest apresentará o resultado no terminal.

Exemplo:

```text
======================== test session starts ========================
...
========================= 7 passed in ...s ==========================
```

A mensagem `passed` indica que os testes foram executados com sucesso.

## Testes no GitHub Actions

Os testes também são executados automaticamente pelo **GitHub Actions** por meio do workflow:

```text
.github/workflows/ci-backend.yml
```

A execução ocorre em eventos de `push` e `pull_request`, conforme configurado no workflow.

Dessa forma, além da execução local, os testes são verificados automaticamente pelo CI do projeto.
