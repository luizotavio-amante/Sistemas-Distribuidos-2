import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../contexts/useAuth";

export default function ProtectedRoute() {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        Carregando...
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}