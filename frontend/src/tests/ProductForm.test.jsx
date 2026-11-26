import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductForm from "../components/ProductForm";

describe("ProductForm", () => {
  it("deve renderizar os campos do formulário", () => {
    render(
      <ProductForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        saving={false}
      />
    );

    expect(
      screen.getByLabelText("Nome do produto")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Preço (R$)")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Quantidade em estoque")
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText("Estoque mínimo")
    ).toBeInTheDocument();
  });

  it("deve cadastrar um produto com os dados informados", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <ProductForm
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        saving={false}
      />
    );

    await user.type(
      screen.getByLabelText("Nome do produto"),
      "Coxinha"
    );

    const price = screen.getByLabelText("Preço (R$)");
    await user.clear(price);
    await user.type(price, "7.50");

    const quantity = screen.getByLabelText(
      "Quantidade em estoque"
    );
    await user.clear(quantity);
    await user.type(quantity, "20");

    const minimumStock = screen.getByLabelText(
      "Estoque mínimo"
    );
    await user.clear(minimumStock);
    await user.type(minimumStock, "5");

    await user.click(
      screen.getByRole("button", { name: "Salvar produto" })
    );

    expect(onSubmit).toHaveBeenCalledTimes(1);

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Coxinha",
      price: "7.50",
      quantity: 20,
      minimum_stock: 5,
    });
  });

  it("deve permitir cancelar o formulário", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(
      <ProductForm
        onSubmit={vi.fn()}
        onCancel={onCancel}
        saving={false}
      />
    );

    await user.click(
      screen.getByRole("button", { name: "Cancelar" })
    );

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});