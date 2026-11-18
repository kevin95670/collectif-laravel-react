import { appelerApi } from "./client";

// POST /api/inscription -> AuthentificationController@inscrire
export function inscrire(donnees) {
  return appelerApi("/api/inscription", { method: "POST", donnees });
}

// POST /api/connexion -> AuthentificationController@connecter
export function connecter(donnees) {
  return appelerApi("/api/connexion", { method: "POST", donnees });
}

// POST /api/deconnexion -> AuthentificationController@deconnecter
export function deconnecter() {
  return appelerApi("/api/deconnexion", { method: "POST" });
}

// GET /api/utilisateur -> renvoie la personne connectée (ou une erreur 401 si personne)
export function recupererUtilisateurConnecte() {
  return appelerApi("/api/utilisateur");
}