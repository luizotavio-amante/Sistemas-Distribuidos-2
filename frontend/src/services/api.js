const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function apiRequest(endpoint, options = {}) {
  const token = sessionStorage.getItem("stockflow_token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    const message =
      typeof data?.detail === "string"
        ? data.detail
        : "Não foi possível realizar a operação.";

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}