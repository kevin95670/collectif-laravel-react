import { appelerApi } from "./client";

// Récupère la liste des événements à venir.
// Correspond à la route Laravel : GET /api/evenements (EvenementController@index).
export function recupererEvenements() {
  return appelerApi("/api/evenements");
}

// POST /api/evenements -> EvenementController@creer (réservé aux personnes connectées)
export function creerEvenement(donnees) {
  return appelerApi("/api/evenements", { method: "POST", donnees });
}