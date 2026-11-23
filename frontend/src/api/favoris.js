import { appelerApi } from "./client";

// GET /api/mes-favoris -> [ { ...événement, est_favori: true }, ... ]
export function recupererMesFavoris() {
  return appelerApi("/api/mes-favoris");
}

// POST /api/evenements/{id}/favori
export function ajouterFavori(identifiant) {
  return appelerApi("/api/evenements/" + identifiant + "/favori", { method: "POST" });
}

// DELETE /api/evenements/{id}/favori
export function retirerFavori(identifiant) {
  return appelerApi("/api/evenements/" + identifiant + "/favori", { method: "DELETE" });
}