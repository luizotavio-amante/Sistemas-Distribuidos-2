import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "../../src/App";

function mockResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  };
}

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse([])));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("começa com a lista vazia", async () => {
    render(<App />);

    expect(
      await screen.findByText("Nenhum item cadastrado."),
    ).toBeInTheDocument();
  });

  it("exibe carregamento enquanto consulta a API", async () => {
    let resolveFetch;

    fetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );

    render(<App />);

    expect(screen.getByText("Carregando itens...")).toBeInTheDocument();

    resolveFetch(mockResponse([]));

    expect(
      await screen.findByText("Nenhum item cadastrado."),
    ).toBeInTheDocument();
  });

  it("carrega itens da API com sucesso", async () => {
    fetch.mockResolvedValueOnce(
      mockResponse([
        {
          id: 1,
          name: "Notebook",
          description: "14 polegadas",
        },
      ]),
    );

    render(<App />);

    expect(await screen.findByText("Notebook")).toBeInTheDocument();

    expect(screen.getByText("14 polegadas")).toBeInTheDocument();
  });

  it("cadastra um item e o exibe na lista", async () => {
    const user = userEvent.setup();

    fetch.mockResolvedValueOnce(mockResponse([]));
    fetch.mockResolvedValueOnce(
      mockResponse(
        {
          id: 1,
          name: "Notebook",
          description: "14 polegadas",
        },
        201,
      ),
    );

    render(<App />);

    await screen.findByText("Nenhum item cadastrado.");

    await user.type(screen.getByLabelText("Nome"), "Notebook");

    await user.type(screen.getByLabelText("Descrição"), "14 polegadas");

    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(await screen.findByText("Notebook")).toBeInTheDocument();

    expect(screen.getByText("14 polegadas")).toBeInTheDocument();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/items"),
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("não cadastra item com nome inválido", async () => {
    const user = userEvent.setup();

    render(<App />);

    await screen.findByText("Nenhum item cadastrado.");

    await user.type(screen.getByLabelText("Nome"), "   ");

    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(screen.getByRole("alert")).toBeInTheDocument();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("acumula vários itens", async () => {
    const user = userEvent.setup();

    fetch
      .mockResolvedValueOnce(mockResponse([]))
      .mockResolvedValueOnce(
        mockResponse({ id: 1, name: "Notebook", description: null }, 201),
      )
      .mockResolvedValueOnce(
        mockResponse({ id: 2, name: "Mouse", description: null }, 201),
      );

    render(<App />);

    await screen.findByText("Nenhum item cadastrado.");

    for (const name of ["Notebook", "Mouse"]) {
      await user.type(screen.getByLabelText("Nome"), name);

      await user.click(screen.getByRole("button", { name: "Adicionar" }));

      await screen.findByText(name);
    }

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("exibe erro quando a API falha ao listar", async () => {
    fetch.mockRejectedValueOnce(new Error("Falha de conexão"));

    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Erro ao carregar os itens.",
    );
  });

  it("exibe erro quando a API falha ao cadastrar", async () => {
    const user = userEvent.setup();

    fetch
      .mockResolvedValueOnce(mockResponse([]))
      .mockResolvedValueOnce(mockResponse({ detail: "Erro interno" }, 500));

    render(<App />);

    await screen.findByText("Nenhum item cadastrado.");

    await user.type(screen.getByLabelText("Nome"), "Notebook");

    await user.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Erro ao cadastrar o item.",
    );
  });
});
