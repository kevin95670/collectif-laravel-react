import { appelerApi } from "./client";

// GET /api/evenements/{id}/messages            -> les 50 derniers messages
// GET /api/evenements/{id}/messages?apres_id=12 -> seulement ceux plus récents que le n°12
export function recupererMessages(identifiantEvenement, apresIdentifiant = null) {
  const parametre = apresIdentifiant ? "?apres_id=" + apresIdentifiant : "";
  return appelerApi("/api/evenements/" + identifiantEvenement + "/messages" + parametre);
}

// POST /api/evenements/{id}/messages
// reponseAIdentifiant : l'id du message cité (null = message ordinaire)
export function envoyerMessage(identifiantEvenement, contenu, reponseAIdentifiant = null) {
  return appelerApi("/api/evenements/" + identifiantEvenement + "/messages", {
    method: "POST",
    donnees: { contenu: contenu, reponse_a_id: reponseAIdentifiant },
  });
}