import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle,
  Package,
} from "lucide-react";

import { listProducts } from "../services/products";
import { createSale } from "../services/sales";

function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadProducts() {
    setLoading(true);

    try {
      const data = await listProducts();
      setProducts(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleAddProduct(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const product = products.find(
      (item) => item.id === Number(selectedProduct)
    );

    if (!product) {
      setError("Selecione um produto.");
      return;
    }

    const amount = Number(quantity);

    if (!Number.isInteger(amount) || amount <= 0) {
      setError("Informe uma quantidade válida.");
      return;
    }

    const existingItem = cart.find(
      (item) => item.product_id === product.id
    );

    const totalQuantity =
      (existingItem?.quantity ?? 0) + amount;

    if (totalQuantity > product.quantity) {
      setError(
        `Estoque insuficiente. Disponível: ${product.quantity} unidade(s).`
      );
      return;
    }

    if (existingItem) {
      setCart((currentCart) =>
        currentCart.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + amount,
              }
            : item
        )
      );
    } else {
      setCart((currentCart) => [
        ...currentCart,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: amount,
        },
      ]);
    }

    setSelectedProduct("");
    setQuantity(1);
  }

  function removeProduct(productId) {
    setCart((currentCart) =>
      currentCart.filter(
        (item) => item.product_id !== productId
      )
    );
  }

  function clearCart() {
    setCart([]);
    setError("");
    setSuccess("");
  }

  const totalInCents = cart.reduce(
    (total, item) =>
      total +
      Math.round(Number(item.price) * 100) * item.quantity,
    0
  );

  const total = totalInCents / 100;

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  async function handleFinishSale() {
    if (cart.length === 0 || saving) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const items = cart.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const sale = await createSale(items);

      setSuccess(
        `Venda #${sale.id} registrada com sucesso! Total: ${formatCurrency(sale.total)}`
      );

      setCart([]);
      setSelectedProduct("");
      setQuantity(1);

      await loadProducts();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  const availableProducts = products.filter(
    (product) => product.quantity > 0
  );

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Nova venda</h1>
          <p>
            Adicione produtos ao carrinho e registre uma venda.
          </p>
        </div>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message" role="status">
          {success}
        </div>
      )}

      <div className="sales-grid">
        <div className="sales-main">
          <div className="panel">
            <div className="panel-heading">
              <h2>Adicionar produto</h2>
              <Package size={22} />
            </div>

            {loading ? (
              <div className="content-loading" role="status">
                Carregando produtos...
              </div>
            ) : (
              <form onSubmit={handleAddProduct}>
                <div className="form-group">
                  <label htmlFor="sale-product">
                    Produto
                  </label>

                  <select
                    id="sale-product"
                    className="form-input"
                    value={selectedProduct}
                    onChange={(event) =>
                      setSelectedProduct(event.target.value)
                    }
                    disabled={saving}
                    required
                  >
                    <option value="">
                      Selecione um produto
                    </option>

                    {availableProducts.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name} -{" "}
                        {formatCurrency(product.price)} -{" "}
                        Estoque: {product.quantity}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="sale-quantity">
                    Quantidade
                  </label>

                  <input
                    id="sale-quantity"
                    className="form-input"
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(event.target.value)
                    }
                    disabled={saving}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving || !selectedProduct}
                >
                  <Plus size={20} />
                  Adicionar ao carrinho
                </button>
              </form>
            )}
          </div>

          <div className="panel">
            <div className="panel-heading">
              <h2>Carrinho de compras</h2>
              <ShoppingCart size={22} />
            </div>

            {cart.length === 0 ? (
              <div className="empty-state">
                <ShoppingCart size={42} />
                <h3>Carrinho vazio</h3>
                <p>Adicione produtos para iniciar a venda.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th>Preço</th>
                      <th>Qtd.</th>
                      <th>Subtotal</th>
                      <th>Ações</th>
                    </tr>
                  </thead>

                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.product_id}>
                        <td>
                          <strong>{item.name}</strong>
                        </td>

                        <td>
                          {formatCurrency(item.price)}
                        </td>

                        <td>{item.quantity}</td>

                        <td>
                          {formatCurrency(
                            Number(item.price) * item.quantity
                          )}
                        </td>

                        <td>
                          <button
                            className="icon-button delete-button"
                            onClick={() =>
                              removeProduct(item.product_id)
                            }
                            disabled={saving}
                            aria-label={`Remover ${item.name}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="panel sale-summary">
          <div className="panel-heading">
            <h2>Resumo da venda</h2>
          </div>

          <div className="summary-row">
            <span>Produtos diferentes</span>
            <strong>{cart.length}</strong>
          </div>

          <div className="summary-row">
            <span>Total de unidades</span>
            <strong>{totalItems}</strong>
          </div>

          <div className="sale-total">
            <span>Valor total</span>
            <strong>{formatCurrency(total)}</strong>
          </div>

          <button
            className="primary-button finish-sale-button"
            onClick={handleFinishSale}
            disabled={
              saving || loading || cart.length === 0
            }
          >
            <CheckCircle size={20} />

            {saving
              ? "Registrando venda..."
              : "Finalizar venda"}
          </button>

          <button
            className="secondary-button clear-cart-button"
            onClick={clearCart}
            disabled={saving || cart.length === 0}
          >
            <Trash2 size={18} />
            Limpar carrinho
          </button>

          <p className="sale-info">
            O estoque será atualizado automaticamente após
            a confirmação da venda.
          </p>
        </div>
      </div>
    </div>
  );
}