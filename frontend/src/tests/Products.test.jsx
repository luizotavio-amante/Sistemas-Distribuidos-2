import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Products from "../pages/Products";

describe("Página de produtos", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it("deve exibir o estado de carregamento", () => {
    fetch.mockImplementation(
      () => new Promise(() => {})
    );

    render(<Products />);

    expect(
      screen.getByText("Carregando produtos...")
    ).toBeInTheDocument();
  });

  it("deve exibir os produtos retornados pela API", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [
        {
          id: 1,
          name: "Coxinha",
          price: "7.50",
          quantity: 20,
          minimum_stock: 5,
        },
        {
          id: 2,
          name: "Pastel",
          price: "8.00",
          quantity: 15,
          minimum_stock: 5,
        },
      ],
    });

    render(<Products />);

    expect(
      await screen.findByText("Coxinha")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Pastel")
    ).toBeInTheDocument();
  });

  it("deve exibir uma mensagem quando não existem produtos", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    render(<Products />);

    expect(
      await screen.findByText(/Nenhum produto encontrado/i)
    ).toBeInTheDocument();
  });

  it("deve exibir uma mensagem de erro quando a API falhar", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        detail: "Erro ao carregar produtos",
      }),
    });

    render(<Products />);

    expect(
      await screen.findByText("Erro ao carregar produtos")
    ).toBeInTheDocument();
  });
});