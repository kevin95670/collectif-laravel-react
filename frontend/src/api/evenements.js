import { appelerApi } from "./client";

// GET /api/evenements?sport=football&ville=Lyon&date=2026-12-05 -> EvenementController@index
// "filtres" est un objet : { sport: "football", ville: "", date: "" }
// Sans argument, filtres vaut {} et on récupère tout, comme avant (l'accueil continue de marcher).
export function recupererEvenements(filtres = {}) {
  // URLSearchParams fabrique la partie "?cle=valeur&cle2=valeur2" (et encode les accents/espaces)
  const parametres = new URLSearchParams();

  // Object.entries transforme { sport: "football" } en [["sport", "football"]]
  Object.entries(filtres).forEach(([cle, valeur]) => {
    if (valeur) {
      parametres.set(cle, valeur);   // on n'ajoute que les filtres remplis
    }
  });

  const texteParametres = parametres.toString();
  return appelerApi("/api/evenements" + (texteParametres ? "?" + texteParametres : ""));
}

// POST /api/evenements -> EvenementController@creer (réservé aux personnes connectées)
export function creerEvenement(donnees) {
  return appelerApi("/api/evenements", { method: "POST", donnees });
}

// GET /api/evenements/{id} -> EvenementController@afficher
export function recupererEvenement(identifiant) {
  return appelerApi("/api/evenements/" + identifiant);
}

// POST /api/evenements/{id}/inscription -> EvenementController@rejoindre
export function rejoindreEvenement(identifiant) {
  return appelerApi("/api/evenements/" + identifiant + "/inscription", { method: "POST" });
}

// DELETE /api/evenements/{id}/inscription -> EvenementController@quitter
export function quitterEvenement(identifiant) {
  return appelerApi("/api/evenements/" + identifiant + "/inscription", { method: "DELETE" });
}