import { useState } from "react";
import { Save, X } from "lucide-react";

export default function ProductForm({
  product,
  onSubmit,
  onCancel,
  saving,
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product?.price ?? "");
  const [quantity, setQuantity] = useState(
    product?.quantity ?? 0
  );
  const [minimumStock, setMinimumStock] = useState(
    product?.minimum_stock ?? 5
  );

  function handleSubmit(event) {
    event.preventDefault();

    onSubmit({
      name: name.trim(),
      price: String(price),
      quantity: Number(quantity),
      minimum_stock: Number(minimumStock),
    });
  }

  return (
    <div className="panel product-form">
      <div className="panel-heading">
        <h2>
          {product ? "Editar produto" : "Cadastrar produto"}
        </h2>

        <button
          type="button"
          className="icon-button"
          onClick={onCancel}
          disabled={saving}
          aria-label="Fechar formulário"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="product-name">Nome do produto</label>

            <input
              id="product-name"
              className="form-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Coxinha"
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="product-price">Preço (R$)</label>

            <input
              id="product-price"
              className="form-input"
              type="number"
              min="0.01"
              max="99999999.99"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="product-quantity">
              Quantidade em estoque
            </label>

            <input
              id="product-quantity"
              className="form-input"
              type="number"
              min="0"
              step="1"
              value={quantity}
              onChange={(event) =>
                setQuantity(event.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="minimum-stock">
              Estoque mínimo
            </label>

            <input
              id="minimum-stock"
              className="form-input"
              type="number"
              min="0"
              step="1"
              value={minimumStock}
              onChange={(event) =>
                setMinimumStock(event.target.value)
              }
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="primary-button compact-button"
            disabled={saving || !name.trim()}
          >
            <Save size={18} />
            {saving ? "Salvando..." : "Salvar produto"}
          </button>
        </div>
      </form>
    </div>
  );
}