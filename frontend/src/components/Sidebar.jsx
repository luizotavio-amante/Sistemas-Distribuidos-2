import { NavLink } from "react-router-dom";
import {
  Boxes,
  LayoutDashboard,
  Package,
  ShoppingCart,
  History,
  LogOut,
} from "lucide-react";

import { useAuth } from "../contexts/useAuth";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Produtos",
    path: "/products",
    icon: Package,
  },
  {
    name: "Nova venda",
    path: "/sales",
    icon: ShoppingCart,
  },
  {
    name: "Histórico de vendas",
    path: "/sales-history",
    icon: History,
  },
];

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Boxes size={32} />

        <div>
          <h2>StockFlow</h2>
          <span>Gestão de estoque</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="sidebar-label">MENU PRINCIPAL</span>

        {menuItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={20} />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="logout-button"
          onClick={logout}
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
  );
}