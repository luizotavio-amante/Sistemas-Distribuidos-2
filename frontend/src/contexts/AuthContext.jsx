import { useEffect, useState } from "react";

import { AuthContext } from "./auth-context";

import {
  login as loginRequest,
  register as registerRequest,
  getCurrentUser,
} from "../services/auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const token = sessionStorage.getItem("stockflow_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        sessionStorage.removeItem("stockflow_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function login(email, password) {
    const data = await loginRequest(email, password);

    sessionStorage.setItem(
      "stockflow_token",
      data.access_token
    );

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      sessionStorage.removeItem("stockflow_token");
      setUser(null);
      throw error;
    }
  }

  async function register(name, email, password) {
    return registerRequest(name, email, password);
  }

  function logout() {
    sessionStorage.removeItem("stockflow_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authenticated: Boolean(user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}