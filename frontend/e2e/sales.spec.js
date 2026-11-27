import { expect, test } from "@playwright/test";

test("deve registrar uma venda e atualizar o estoque", async ({ page, request }) => {
  const email = `vendas.e2e.${crypto.randomUUID()}@stockflow.com`;
  const password = "Teste12345";
  const productName = `Venda E2E ${crypto.randomUUID().slice(0, 8)}`;

  // Cadastrar usuário
  const registerResponse = await request.post("http://localhost:8000/auth/register", {
    data: {
      name: "Usuario E2E Vendas",
      email,
      password,
    },
  });

  expect(registerResponse.status()).toBe(201);

  // Obter token de autenticação
  const loginResponse = await request.post("http://localhost:8000/auth/login", {
    data: {
      email,
      password,
    },
  });

  expect(loginResponse.status()).toBe(200);

  const { access_token } = await loginResponse.json();

  // Cadastrar produto para o teste
  const productResponse = await request.post("http://localhost:8000/products", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    data: {
      name: productName,
      price: "10.00",
      quantity: 20,
      minimum_stock: 5,
    },
  });

  expect(productResponse.status()).toBe(201);

  const product = await productResponse.json();

  // Realizar login pelo navegador
  await page.goto("/login");

  await page.getByLabel(/E-mail/i).fill(email);
  await page.getByLabel(/^Senha$/i).fill(password);

  await page
    .getByRole("button", {
      name: /Entrar/i,
    })
    .click();

  await expect(page).toHaveURL(/\/dashboard$/);

  // Acessar página de vendas
  await page.goto("/sales");

  await expect(
    page.getByRole("option", {
      name: new RegExp(productName),
    }),
  ).toBeAttached();

  await page.getByLabel("Produto").selectOption(String(product.id));

  await page.getByLabel("Quantidade").fill("3");

  await page
    .getByRole("button", {
      name: "Adicionar ao carrinho",
    })
    .click();

  // Verificar produto no carrinho
  await expect(
    page.getByRole("button", {
      name: `Remover ${productName}`,
    }),
  ).toBeVisible();

  // Verificar valor total
  await expect(page.getByText(/R\$\s*30,00/).first()).toBeVisible();

  // Finalizar venda
  await page
    .getByRole("button", {
      name: "Finalizar venda",
    })
    .click();

  await expect(page.getByText(/Venda #\d+ registrada com sucesso/i)).toBeVisible();

  // Verificar se o carrinho foi esvaziado
  await expect(page.getByText(/Carrinho vazio/i)).toBeVisible();

  // Consultar estoque atualizado no backend
  const stockResponse = await request.get(`http://localhost:8000/products/${product.id}`, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  expect(stockResponse.status()).toBe(200);

  const updatedProduct = await stockResponse.json();

  expect(updatedProduct.quantity).toBe(17);

  // Verificar estoque atualizado na interface
  await page.goto("/products");

  const productRow = page.getByRole("row").filter({
    hasText: productName,
  });

  await expect(productRow).toBeVisible();

  await expect(
    productRow.getByRole("cell", {
      name: "17",
      exact: true,
    }),
  ).toBeVisible();

  // Confirmar persistência após recarregar
  await page.reload();

  await expect(
    productRow.getByRole("cell", {
      name: "17",
      exact: true,
    }),
  ).toBeVisible();
});
