import { Eye, History, RefreshCw, Search, ShoppingCart, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { listProducts } from "../services/products";
import { listSales } from "../services/sales";

function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(value) {
  return new Date(value).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
  });
}

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError("");
    setSelectedSale(null);

    try {
      const [salesData, productsData] = await Promise.all([listSales(), listProducts()]);

      setSales(salesData);
      setProducts(productsData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  function getProductName(productId) {
    const product = products.find((item) => item.id === productId);

    return product?.name ?? `Produto #${productId}`;
  }

  function getTotalItems(sale) {
    return sale.items.reduce((total, item) => total + item.quantity, 0);
  }

  const filteredSales = sales.filter((sale) =>
    String(sale.id).includes(search.trim().replace(/^#/, "")),
  );

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Histórico de vendas</h1>

          <p>Consulte todas as vendas realizadas no sistema.</p>
        </div>

        <button type="button" className="secondary-button" onClick={loadHistory} disabled={loading}>
          <RefreshCw size={18} />
          Atualizar
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <div className="panel">
        <div className="table-toolbar">
          <div className="input-wrapper search-input">
            <Search size={18} />

            <input
              type="search"
              placeholder="Pesquisar pelo número da venda..."
              aria-label="Pesquisar venda"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="content-loading" role="status">
            Carregando vendas...
          </div>
        ) : error ? (
          <div className="empty-state">
            <p>Não foi possível carregar o histórico.</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="empty-state">
            <History size={42} />

            <h3>Nenhuma venda encontrada</h3>

            <p>
              {search ? "Tente pesquisar outro número." : "As vendas realizadas aparecerão aqui."}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Venda</th>
                  <th>Data e horário</th>
                  <th>Quantidade de itens</th>
                  <th>Valor total</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>
                      <strong>#{sale.id}</strong>
                    </td>

                    <td>{formatDate(sale.created_at)}</td>

                    <td>{getTotalItems(sale)}</td>

                    <td>
                      <strong className="sale-value">{formatCurrency(sale.total)}</strong>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="icon-button edit-button"
                        onClick={() => setSelectedSale(sale)}
                        aria-label={`Visualizar venda ${sale.id}`}
                        title="Visualizar detalhes"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <div className="table-footer">{filteredSales.length} venda(s) encontrada(s)</div>
        )}
      </div>

      {selectedSale && (
        <div className="panel sale-details">
          <div className="panel-heading">
            <div className="sale-details-title">
              <ShoppingCart size={24} />

              <h2>Detalhes da venda #{selectedSale.id}</h2>
            </div>

            <button
              type="button"
              className="icon-button"
              onClick={() => setSelectedSale(null)}
              aria-label="Fechar detalhes"
            >
              <X size={22} />
            </button>
          </div>

          <div className="sale-details-info">
            <div>
              <span>Data da venda</span>
              <strong>{formatDate(selectedSale.created_at)}</strong>
            </div>

            <div>
              <span>Total de unidades</span>
              <strong>{getTotalItems(selectedSale)}</strong>
            </div>

            <div>
              <span>Valor total</span>

              <strong className="sale-value">{formatCurrency(selectedSale.total)}</strong>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Preço unitário</th>
                  <th>Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {selectedSale.items.map((item) => (
                  <tr key={item.id}>
                    <td>{getProductName(item.product_id)}</td>

                    <td>{item.quantity}</td>

                    <td>{formatCurrency(item.unit_price)}</td>

                    <td>{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="sale-details-total">
            <span>Total da venda</span>

            <strong>{formatCurrency(selectedSale.total)}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
