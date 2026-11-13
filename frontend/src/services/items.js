export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const ITEMS_URL = `${API_URL}/items`;

async function request(url, options, errorMessage) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    if (error.message === errorMessage) {
      throw error;
    }

    throw new Error(errorMessage);
  }
}

export function listItems() {
  return request(ITEMS_URL, undefined, "Erro ao carregar os itens.");
}

export function createItem({ name, description }) {
  return request(
    ITEMS_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description: description || null,
      }),
    },
    "Erro ao cadastrar o item.",
  );
}
