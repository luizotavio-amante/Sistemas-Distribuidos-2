import { useEffect, useState } from "react";

import {
  Package,
  Boxes,
  TriangleAlert,
  ShoppingCart,
  Wallet,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../contexts/useAuth";
import { getDashboard } from "../services/dashboard";
import StatCard from "../components/StatCard";

function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function Dashboard() {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const response = await getDashboard();
      setData(response);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div>
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>

          <p>
            Bem-vindo, {user?.name}! Acompanhe os indicadores
            do seu negócio.
          </p>
        </div>

        <button
          className="secondary-button"
          onClick={loadDashboard}
          disabled={loading}
        >
          <RefreshCw size={18} />
          Atualizar
        </button>
      </div>

      {loading && (
        <div className="content-loading" role="status">
          Carregando indicadores...
        </div>
      )}

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div className="stats-grid">
            <StatCard
              title="Produtos cadastrados"
              value={data.total_products}
              icon={Package}
              color="blue"
              description="Total de produtos no sistema"
            />

            <StatCard
              title="Unidades em estoque"
              value={data.total_stock}
              icon={Boxes}
              color="purple"
              description="Quantidade total disponível"
            />

            <StatCard
              title="Estoque baixo"
              value={data.low_stock_products}
              icon={TriangleAlert}
              color="red"
              description="Produtos que precisam de atenção"
            />

            <StatCard
              title="Vendas realizadas"
              value={data.total_sales}
              icon={ShoppingCart}
              color="orange"
              description="Total de vendas registradas"
            />

            <StatCard
              title="Faturamento total"
              value={formatCurrency(data.total_revenue)}
              icon={Wallet}
              color="green"
              description="Receita acumulada"
            />

            <StatCard
              title="Faturamento do dia"
              value={formatCurrency(data.daily_revenue)}
              icon={CalendarDays}
              color="green"
              description="Receita registrada hoje"
            />
          </div>

          {data.low_stock_products > 0 && (
            <div className="stock-alert" role="status">
              <TriangleAlert size={24} />

              <div>
                <strong>Atenção ao estoque!</strong>

                <p>
                  Existem {data.low_stock_products} produto(s)
                  com quantidade igual ou inferior ao estoque
                  mínimo.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}