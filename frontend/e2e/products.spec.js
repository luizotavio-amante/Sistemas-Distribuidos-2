import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page, request }) => {
  const email = `produtos.e2e.${crypto.randomUUID()}@stockflow.com`;
  const password = "Teste12345";

  const response = await request.post("http://localhost:8000/auth/register", {
    data: {
      name: "Usuario E2E",
      email,
      password,
    },
  });

  expect(response.status()).toBe(201);

  await page.goto("/login");

  await page.getByLabel(/E-mail/i).fill(email);
  await page.getByLabel(/^Senha$/i).fill(password);

  await page
    .getByRole("button", {
      name: /Entrar/i,
    })
    .click();

  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/products");
});

test("deve cadastrar, editar e excluir um produto com persistência", async ({ page }) => {
  const productName = `Produto E2E ${crypto.randomUUID().slice(0, 8)}`;
  const updatedName = `${productName} Editado`;

  // Cadastrar produto
  await page
    .getByRole("button", {
      name: "Novo produto",
    })
    .click();

  await page.getByLabel("Nome do produto").fill(productName);
  await page.getByLabel("Preço (R$)").fill("10.50");
  await page.getByLabel("Quantidade em estoque").fill("20");
  await page.getByLabel("Estoque mínimo").fill("5");

  await page
    .getByRole("button", {
      name: "Salvar produto",
    })
    .click();

  await expect(page.getByText("Produto cadastrado com sucesso!")).toBeVisible();

  await expect(page.getByText(productName, { exact: true })).toBeVisible();

  // Verificar persistência após recarregar
  await page.reload();

  await expect(page.getByText(productName, { exact: true })).toBeVisible();

  // Editar produto
  await page
    .getByRole("button", {
      name: `Editar ${productName}`,
      exact: true,
    })
    .click();

  await page.getByLabel("Nome do produto").fill(updatedName);
  await page.getByLabel("Preço (R$)").fill("12.50");
  await page.getByLabel("Quantidade em estoque").fill("30");

  await page
    .getByRole("button", {
      name: "Salvar produto",
    })
    .click();

  await expect(page.getByText("Produto atualizado com sucesso!")).toBeVisible();

  // Verificar persistência da edição
  await page.reload();

  const productRow = page.getByRole("row").filter({
    hasText: updatedName,
  });

  await expect(productRow).toBeVisible();
  await expect(productRow).toContainText(/12,50/);
  await expect(productRow).toContainText("30");

  // Excluir produto
  page.once("dialog", (dialog) => dialog.accept());

  await page
    .getByRole("button", {
      name: `Excluir ${updatedName}`,
      exact: true,
    })
    .click();

  await expect(page.getByText("Produto excluído com sucesso!")).toBeVisible();

  await expect(productRow).toHaveCount(0);

  // Confirmar que a exclusão foi persistida
  await page.reload();

  await expect(page.getByText("Carregando produtos...")).toBeHidden();

  await expect(page.getByText(updatedName, { exact: true })).toHaveCount(0);
});
