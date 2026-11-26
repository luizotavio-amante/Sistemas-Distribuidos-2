import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Boxes, User, Mail, Lock, UserPlus } from "lucide-react";

import { useAuth } from "../contexts/useAuth";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password);
      setSuccess("Conta criada com sucesso!");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <Boxes size={42} />
          <h1>StockFlow</h1>
          <p>Sistema de Controle de Estoque e Vendas</p>
        </div>

        <h2>Criar conta</h2>

        <p className="auth-description">
          Preencha seus dados para começar.
        </p>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        {success ? (
          <>
            <div className="success-message" role="status">
              {success}
            </div>

            <button
              className="primary-button"
              onClick={() => navigate("/login")}
            >
              Ir para o login
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nome completo</label>

              <div className="input-wrapper">
                <User size={18} />

                <input
                  id="name"
                  type="text"
                  placeholder="Digite seu nome"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail</label>

              <div className="input-wrapper">
                <Mail size={18} />

                <input
                  id="email"
                  type="email"
                  placeholder="Digite seu e-mail"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>

              <div className="input-wrapper">
                <Lock size={18} />

                <input
                  id="password"
                  type="password"
                  placeholder="Mínimo de 8 caracteres"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  maxLength={128}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirmar senha
              </label>

              <div className="input-wrapper">
                <Lock size={18} />

                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirme sua senha"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  required
                />
              </div>
            </div>

            <button
              className="primary-button"
              type="submit"
              disabled={loading}
            >
              <UserPlus size={18} />

              {loading ? "Cadastrando..." : "Criar conta"}
            </button>
          </form>
        )}

        <p className="auth-footer">
          Já possui uma conta?{" "}
          <Link to="/login">Faça login</Link>
        </p>
      </div>
    </div>
  );
}