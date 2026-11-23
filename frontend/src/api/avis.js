import { appelerApi } from "./client";

// GET /api/organisateurs/{id}/avis -> { moyenne, nombre, avis: [...] }
export function recupererAvisOrganisateur(identifiantOrganisateur) {
  return appelerApi("/api/organisateurs/" + identifiantOrganisateur + "/avis");
}

// POST /api/evenements/{id}/avis -> { id, note, commentaire }
export function donnerAvis(identifiantEvenement, donnees) {
  return appelerApi("/api/evenements/" + identifiantEvenement + "/avis", { method: "POST", donnees });
}