import { apiRequest } from "./api";

export function listSales() {
  return apiRequest("/sales");
}

export function getSale(id) {
  return apiRequest(`/sales/${id}`);
}

export function createSale(items) {
  return apiRequest("/sales", {
    method: "POST",
    body: JSON.stringify({ items }),
  });
}
