
$ErrorActionPreference = "Stop"

$env:COMPOSE_PROJECT_NAME = "lab-e2e"
$composeFile = "docker-compose.e2e.yaml"

try {
    Write-Host "Iniciando ambiente E2E..."

    docker compose -f $composeFile up -d --build --wait

    if ($LASTEXITCODE -ne 0) {
        throw "Erro ao iniciar os containers."
    }

    Write-Host "Aplicando migrations..."

    docker compose -f $composeFile exec -T api poetry run alembic upgrade head

    if ($LASTEXITCODE -ne 0) {
        throw "Erro ao aplicar migrations."
    }

    Write-Host "Executando testes Playwright..."

    $env:E2E_ISOLATED = "true"

    npm --prefix frontend run test:e2e

    if ($LASTEXITCODE -ne 0) {
        throw "Os testes E2E falharam."
    }

    Write-Host "Testes E2E concluidos com sucesso!"
}
finally {
    Write-Host "Removendo containers lab-e2e..."

    docker compose -f $composeFile down -v --remove-orphans

    Remove-Item Env:\E2E_ISOLATED -ErrorAction SilentlyContinue
    Remove-Item Env:\COMPOSE_PROJECT_NAME -ErrorAction SilentlyContinue
}
