import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Sales from "../pages/Sales";

const products = [
  {
    id: 1,
    name: "Coxinha",
    price: "7.50",
    quantity: 20,
    minimum_stock: 5,
  },
];

describe("Página de vendas", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    sessionStorage.clear();

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => products,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it("deve iniciar com o carrinho vazio", async () => {
    render(<Sales />);

    await screen.findByRole("option", {
      name: /Coxinha/i,
    });

    expect(
      screen.getByText(/Carrinho vazio/i)
    ).toBeInTheDocument();
  });

  it("deve adicionar um produto ao carrinho", async () => {
    const user = userEvent.setup();

    render(<Sales />);

    await screen.findByRole("option", {
      name: /Coxinha/i,
    });

    await user.selectOptions(
      screen.getByLabelText("Produto"),
      "1"
    );

    const quantity = screen.getByLabelText("Quantidade");

    await user.clear(quantity);
    await user.type(quantity, "2");

    await user.click(
      screen.getByRole("button", {
        name: "Adicionar ao carrinho",
      })
    );

    expect(
      screen.getByRole("button", {
        name: "Remover Coxinha",
      })
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(/R\$\s*15,00/).length
    ).toBeGreaterThan(0);
  });

  it("deve impedir quantidade superior ao estoque", async () => {
    const user = userEvent.setup();

    render(<Sales />);

    await screen.findByRole("option", {
      name: /Coxinha/i,
    });

    await user.selectOptions(
      screen.getByLabelText("Produto"),
      "1"
    );

    const quantity = screen.getByLabelText("Quantidade");

    await user.clear(quantity);
    await user.type(quantity, "21");

    await user.click(
      screen.getByRole("button", {
        name: "Adicionar ao carrinho",
      })
    );

    expect(
      screen.getByRole("alert")
    ).toHaveTextContent(/Estoque insuficiente/i);

    expect(
      screen.queryByRole("button", {
        name: "Remover Coxinha",
      })
    ).not.toBeInTheDocument();
  });

  it("deve remover um produto do carrinho", async () => {
    const user = userEvent.setup();

    render(<Sales />);

    await screen.findByRole("option", {
      name: /Coxinha/i,
    });

    await user.selectOptions(
      screen.getByLabelText("Produto"),
      "1"
    );

    await user.click(
      screen.getByRole("button", {
        name: "Adicionar ao carrinho",
      })
    );

    await user.click(
      screen.getByRole("button", {
        name: "Remover Coxinha",
      })
    );

    expect(
      screen.getByText(/Carrinho vazio/i)
    ).toBeInTheDocument();
  });
});