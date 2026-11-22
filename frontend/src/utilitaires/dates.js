// Transforme "2026-12-05T17:00:00.000000Z" en "samedi 5 décembre, 18:00" (heure locale du navigateur)
export function formaterDate(dateTexte) {
  return new Date(dateTexte).toLocaleString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Transforme une date de l'API en valeur pour un champ datetime-local ("2026-12-05T18:00", heure locale)
export function versChampDateHeure(dateTexte) {
  const date = new Date(dateTexte);
  // getTimezoneOffset() : écart en minutes entre l'UTC et l'heure locale (-60 en hiver à Paris)
  const decalageEnMinutes = date.getTimezoneOffset();
  const dateLocale = new Date(date.getTime() - decalageEnMinutes * 60000);
  // toISOString() donne "2026-12-05T18:00:00.000Z" : on garde les 16 premiers caractères
  return dateLocale.toISOString().slice(0, 16);
}

// Heure d'un message : "14:32" aujourd'hui, "19/11 14:32" un autre jour
export function formaterHeureMessage(dateTexte) {
  const date = new Date(dateTexte);
  const estAujourdhui = date.toDateString() === new Date().toDateString();

  if (estAujourdhui) {
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

// "à l'instant", "il y a 5 min", "il y a 3 h", "il y a 2 j"
export function formaterDepuis(dateIso) {
  const secondes = Math.floor((Date.now() - new Date(dateIso).getTime()) / 1000);

  if (secondes < 60) return "à l'instant";
  if (secondes < 3600) return "il y a " + Math.floor(secondes / 60) + " min";
  if (secondes < 86400) return "il y a " + Math.floor(secondes / 3600) + " h";
  return "il y a " + Math.floor(secondes / 86400) + " j";
}

// "2026-11-21T19:00:00Z" devient "sam. 21 nov. · 20:00" (heure locale du navigateur)
export function formaterDateCourte(dateTexte) {
  const date = new Date(dateTexte);
  const jour = date.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
  const heure = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return jour + " · " + heure;
}