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

  if (methode !== "GET") {
    if (!lireCookie("XSRF-TOKEN")) await obtenirCookieCsrf();
    entetes["X-XSRF-TOKEN"] = lireCookie("XSRF-TOKEN");
  }

  let corps;
  if (options.formulaire) {
    corps = options.formulaire;
  } else if (options.donnees) {
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
    const erreur = new Error(donnees?.message ?? "Erreur " + reponse.status);
    erreur.statut = reponse.status;
    erreur.erreurs = donnees?.errors ?? {};
    throw erreur;
  }
  return donnees;
}