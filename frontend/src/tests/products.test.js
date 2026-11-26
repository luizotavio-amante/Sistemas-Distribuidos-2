import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { listProducts, createProduct } from "../services/products";

describe("Serviço de produtos", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it("deve listar os produtos cadastrados", async () => {
    const products = [
      {
        id: 1,
        name: "Coxinha",
        price: "7.50",
        quantity: 20,
        minimum_stock: 5,
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => products,
    });

    const result = await listProducts();

    expect(result).toEqual(products);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("deve cadastrar um novo produto", async () => {
    const product = {
      name: "Pastel",
      price: "8.00",
      quantity: 15,
      minimum_stock: 5,
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        id: 2,
        ...product,
      }),
    });

    const result = await createProduct(product);

    expect(result).toEqual({
      id: 2,
      ...product,
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/products"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(product),
      })
    );
  });

  it("deve tratar erros retornados pela API", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        detail: "Erro ao carregar produtos",
      }),
    });

    await expect(listProducts()).rejects.toThrow(
      "Erro ao carregar produtos"
    );
  });

  it("deve tratar falhas de conexão", async () => {
    fetch.mockRejectedValueOnce(
      new Error("Falha na conexão")
    );

    await expect(listProducts()).rejects.toThrow(
      "Falha na conexão"
    );
  });

  it("deve enviar o token de autenticação", async () => {
    sessionStorage.setItem("stockflow_token", "token-teste");

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    await listProducts();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/products"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-teste",
        }),
      })
    );
  });
});