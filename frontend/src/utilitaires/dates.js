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