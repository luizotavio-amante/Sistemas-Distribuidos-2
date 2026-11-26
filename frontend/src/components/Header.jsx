import { CircleUserRound } from "lucide-react";

import { useAuth } from "../contexts/useAuth";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="main-header">
      <div>
        <h3>Sistema de Gestão</h3>
        <span>Controle de estoque e vendas</span>
      </div>

      <div className="header-user">
        <CircleUserRound size={34} />

        <div>
          <strong>{user?.name}</strong>
          <span>{user?.email}</span>
        </div>
      </div>
    </header>
  );
}