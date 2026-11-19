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