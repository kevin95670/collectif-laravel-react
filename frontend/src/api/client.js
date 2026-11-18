// Adresse de base de l'API (variable définie dans docker-compose.yml).
const URL_API = import.meta.env.VITE_API_URL;

// Lit la valeur d'un cookie du navigateur à partir de son nom.
function lireCookie(nom) {
  const correspondance = document.cookie.match(new RegExp("(^|; )" + nom + "=([^;]*)"));
  return correspondance ? decodeURIComponent(correspondance[2]) : null;
}

// Demande à Laravel de déposer le cookie XSRF-TOKEN (étape 1 du schéma de Sanctum).
async function obtenirCookieCsrf() {
  await fetch(URL_API + "/sanctum/csrf-cookie", { credentials: "include" });
}

// Fonction commune : tous les autres fichiers de api/ passent par elle.
// options.donnees : un objet JavaScript à envoyer en JSON (pour POST, PUT...).
export async function appelerApi(chemin, options = {}) {
  const methode = (options.method || "GET").toUpperCase();
  const modifieDesDonnees = methode !== "GET";

  // Pour toute requête qui modifie des données, Laravel exige le jeton CSRF.
  if (modifieDesDonnees && !lireCookie("XSRF-TOKEN")) {
    await obtenirCookieCsrf();
  }

  const entetes = { Accept: "application/json" };
  if (modifieDesDonnees) {
    entetes["X-XSRF-TOKEN"] = lireCookie("XSRF-TOKEN");  // on renvoie le jeton lu dans le cookie
  }
  if (options.donnees) {
    entetes["Content-Type"] = "application/json";
  }

  const reponse = await fetch(URL_API + chemin, {
    method: methode,
    credentials: "include",   // le navigateur envoie et reçoit les cookies
    headers: entetes,
    body: options.donnees ? JSON.stringify(options.donnees) : undefined,
  });

  // fetch ne signale pas les erreurs HTTP tout seul : on le fait nous-mêmes.
  if (!reponse.ok) {
    // Laravel renvoie du JSON même pour les erreurs. Pour un 422 (données invalides),
    // il y a une clé "errors" : { email: ["..."], password: ["..."] }.
    const corps = await reponse.json().catch(() => ({}));
    const erreur = new Error(corps.message || "Erreur " + reponse.status);
    erreur.statut = reponse.status;
    erreur.erreurs = corps.errors || {};
    throw erreur;
  }

  return reponse.json();
}