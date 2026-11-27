import { expect, test } from "@playwright/test";

test("deve cadastrar um usuário, realizar login e sair", async ({ page }) => {
  const email = `teste.e2e.${crypto.randomUUID()}@stockflow.com`;
  const password = "Teste12345";

  await page.goto("/register");

  await page.getByLabel(/^Nome/i).fill("Usuario E2E");
  await page.getByLabel(/E-mail/i).fill(email);
  await page.getByLabel(/^Senha$/i).fill(password);
  await page.getByLabel(/Confirmar senha/i).fill(password);

  await page
    .getByRole("button", {
      name: /Cadastrar|Criar conta/i,
    })
    .click();

  await expect(page.getByText("Conta criada com sucesso!")).toBeVisible();

  await page
    .getByRole("button", {
      name: "Ir para o login",
    })
    .click();

  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel(/E-mail/i).fill(email);
  await page.getByLabel(/^Senha$/i).fill(password);

  await page
    .getByRole("button", {
      name: /Entrar/i,
    })
    .click();

  await expect(page).toHaveURL(/\/dashboard$/);

  await page.reload();

  await expect(page).toHaveURL(/\/dashboard$/);

  await page
    .getByRole("button", {
      name: "Sair",
    })
    .click();

  await expect(page).toHaveURL(/\/login$/);
});

test("deve impedir acesso ao dashboard sem autenticação", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/login$/);
});

test("deve impedir login com credenciais inválidas", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel(/E-mail/i).fill(`inexistente.${crypto.randomUUID()}@stockflow.com`);

  await page.getByLabel(/^Senha$/i).fill("SenhaInvalida123");

  await page
    .getByRole("button", {
      name: /Entrar/i,
    })
    .click();

  await expect(page.getByText("E-mail ou senha inválidos")).toBeVisible();

  await expect(page).toHaveURL(/\/login$/);
});
