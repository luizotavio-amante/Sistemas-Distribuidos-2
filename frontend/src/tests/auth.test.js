import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser, login, register } from "../services/auth";

describe("Serviço de autenticação", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it("deve realizar login com sucesso", async () => {
    const token = {
      access_token: "token-teste",
      token_type: "bearer",
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => token,
    });

    const result = await login("teste@stockflow.com", "Teste12345");

    expect(result).toEqual(token);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/login"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "teste@stockflow.com",
          password: "Teste12345",
        }),
      }),
    );
  });

  it("deve tratar credenciais inválidas", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        detail: "E-mail ou senha inválidos",
      }),
    });

    await expect(login("teste@stockflow.com", "senhaerrada")).rejects.toThrow(
      "E-mail ou senha inválidos",
    );
  });

  it("deve cadastrar um novo usuário", async () => {
    const user = {
      id: 1,
      name: "Usuario Teste",
      email: "teste@stockflow.com",
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => user,
    });

    const result = await register("Usuario Teste", "teste@stockflow.com", "Teste12345");

    expect(result).toEqual(user);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/register"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Usuario Teste",
          email: "teste@stockflow.com",
          password: "Teste12345",
        }),
      }),
    );
  });

  it("deve tratar e-mail já cadastrado", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        detail: "E-mail já cadastrado",
      }),
    });

    await expect(register("Usuario Teste", "teste@stockflow.com", "Teste12345")).rejects.toThrow(
      "E-mail já cadastrado",
    );
  });

  it("deve consultar o usuário autenticado", async () => {
    sessionStorage.setItem("stockflow_token", "token-teste");

    const user = {
      id: 1,
      name: "Usuario Teste",
      email: "teste@stockflow.com",
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => user,
    });

    const result = await getCurrentUser();

    expect(result).toEqual(user);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/me"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-teste",
        }),
      }),
    );
  });
});
