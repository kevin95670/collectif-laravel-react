import { appelerApi } from "./client";

// GET /api/organisateurs/{id}
export function recupererOrganisateur(identifiant) {
  return appelerApi("/api/organisateurs/" + identifiant);
}