import { Package, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import ProductForm from "../components/ProductForm";

import { createProduct, deleteProduct, listProducts, updateProduct } from "../services/products";

function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await listProducts();
      setProducts(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function openCreateForm() {
    setEditingProduct(null);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(product) {
    setEditingProduct(product);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingProduct(null);
  }

  async function handleSave(product) {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, product);
        setSuccess("Produto atualizado com sucesso!");
      } else {
        await createProduct(product);
        setSuccess("Produto cadastrado com sucesso!");
      }

      closeForm();
      await loadProducts();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(`Deseja realmente excluir o produto "${product.name}"?`);

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      await deleteProduct(product.id);
      setSuccess("Produto excluído com sucesso!");
      await loadProducts();
    } catch (error) {
      setError(error.message);
    } finally {
      setDeleting(false);
    }
  }

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()),
  );

  const busy = saving || deleting;

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Produtos</h1>
          <p>Gerencie os produtos e controle seu estoque.</p>
        </div>

        <button
          type="button"
          className="primary-button compact-button"
          onClick={openCreateForm}
          disabled={busy}
        >
          <Plus size={20} />
          Novo produto
        </button>
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

      {showForm && (
        <ProductForm
          key={editingProduct?.id ?? "new"}
          product={editingProduct}
          onSubmit={handleSave}
          onCancel={closeForm}
          saving={saving}
        />
      )}

      <div className="panel">
        <div className="table-toolbar">
          <div className="input-wrapper search-input">
            <Search size={18} />

            <input
              type="search"
              placeholder="Pesquisar produto..."
              aria-label="Pesquisar produto"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={loadProducts}
            disabled={loading || busy}
          >
            <RefreshCw size={18} />
            Atualizar
          </button>
        </div>

        {loading ? (
          <div className="content-loading" role="status">
            Carregando produtos...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <Package size={42} />

            <h3>Nenhum produto encontrado</h3>

            <p>{search ? "Tente pesquisar outro nome." : "Cadastre seu primeiro produto."}</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Produto</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Estoque mínimo</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>#{product.id}</td>

                    <td>
                      <strong>{product.name}</strong>
                    </td>

                    <td>{formatCurrency(product.price)}</td>

                    <td>{product.quantity}</td>

                    <td>{product.minimum_stock}</td>

                    <td>
                      {product.quantity <= product.minimum_stock ? (
                        <span className="status-badge status-danger">Estoque baixo</span>
                      ) : (
                        <span className="status-badge status-success">Normal</span>
                      )}
                    </td>

                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="icon-button edit-button"
                          onClick={() => openEditForm(product)}
                          disabled={busy}
                          aria-label={`Editar ${product.name}`}
                          title="Editar produto"
                        >
                          <Pencil size={18} />
                        </button>

                        <button
                          type="button"
                          className="icon-button delete-button"
                          onClick={() => handleDelete(product)}
                          disabled={busy}
                          aria-label={`Excluir ${product.name}`}
                          title="Excluir produto"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="table-footer">{filteredProducts.length} produto(s) encontrado(s)</div>
      </div>
    </div>
  );
}
