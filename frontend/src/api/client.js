// En développement : l'adresse de l'API locale (VITE_API_URL, "http://localhost:8000").
// En production (npm run build) : chaîne vide, le site et l'API sont sur le même domaine,
// les appels deviennent donc de simples chemins comme "/api/evenements".
const URL_API = import.meta.env.PROD ? "" : import.meta.env.VITE_API_URL;

// Lit la valeur d'un cookie du navigateur
function lireCookie(nom) {
  const trouve = document.cookie.match(new RegExp("(^|; )" + nom + "=([^;]*)"));
  return trouve ? decodeURIComponent(trouve[2]) : null;
}

// Demande à Laravel de déposer le cookie XSRF-TOKEN
export async function obtenirCookieCsrf() {
  await fetch(URL_API + "/sanctum/csrf-cookie", { credentials: "include" });
}

export async function appelerApi(chemin, options = {}) {
  const methode = options.method ?? "GET";
  const entetes = { Accept: "application/json", ...options.headers };

  // Pour POST, PUT, DELETE : jeton CSRF recopié dans l'en-tête
  if (methode !== "GET") {
    if (!lireCookie("XSRF-TOKEN")) await obtenirCookieCsrf();
    entetes["X-XSRF-TOKEN"] = lireCookie("XSRF-TOKEN");
  }

  let corps;
  if (options.formulaire) {
    // Envoi de fichier : un objet FormData. On ne met SURTOUT PAS de Content-Type :
    // le navigateur le fabrique lui-même, avec la "frontière" qui sépare les champs.
    corps = options.formulaire;
  } else if (options.donnees) {
    // Raccourci : un objet JavaScript envoyé en JSON
    corps = JSON.stringify(options.donnees);
    entetes["Content-Type"] = "application/json";
  }

  const reponse = await fetch(URL_API + chemin, {
    method: methode,
    credentials: "include",     // envoie et reçoit les cookies
    headers: entetes,
    body: corps,
  });

  const donnees = await reponse.json().catch(() => null);

  if (!reponse.ok) {
    // Laravel renvoie { message, errors: { champ: ["texte"] } } pour une erreur de validation (422)
    const erreur = new Error(donnees?.message ?? "Erreur " + reponse.status);
    erreur.statut = reponse.status;
    erreur.erreurs = donnees?.errors ?? {};
    throw erreur;
  }
  return donnees;
}