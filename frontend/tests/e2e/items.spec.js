import { expect, test } from "@playwright/test";

function uniqueName() {
  return `Item E2E ${crypto.randomUUID()}`;
}

test("carrega a interface e consulta os itens", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Gerenciador de Itens" }),
  ).toBeVisible();

  await expect(page.getByText("Carregando itens...")).toBeHidden();

  await expect(
    page.getByRole("heading", { name: "Itens cadastrados" }),
  ).toBeVisible();
});

test("cadastra um item e o exibe na listagem", async ({ page }) => {
  const name = uniqueName();

  await page.goto("/");

  await page.getByLabel("Nome").fill(name);
  await page.getByLabel("Descrição").fill("14 polegadas");

  await page.getByRole("button", { name: "Adicionar" }).click();

  const item = page.getByRole("listitem").filter({ hasText: name });

  await expect(item).toBeVisible();
  await expect(item).toContainText("14 polegadas");
});

test("não cadastra item sem nome", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Adicionar" }).click();

  await expect(page.getByRole("alert")).toHaveText("O nome é obrigatório.");
});

test("mantém o item cadastrado após recarregar a página", async ({ page }) => {
  const name = uniqueName();

  await page.goto("/");

  await page.getByLabel("Nome").fill(name);
  await page.getByLabel("Descrição").fill("Teste de persistência");

  await page.getByRole("button", { name: "Adicionar" }).click();

  const item = page.getByRole("listitem").filter({ hasText: name });

  await expect(item).toBeVisible();
  await expect(item).toContainText("Teste de persistência");

  // Atualiza a página para verificar a persistência
  await page.reload();

  // O item deve continuar salvo no PostgreSQL
  await expect(item).toBeVisible();
  await expect(item).toContainText("Teste de persistência");
});
