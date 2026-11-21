export const LISTE_DES_SPORTS = [
  { valeur: "football", libelle: "Football" },
  { valeur: "running", libelle: "Running" },
  { valeur: "basket", libelle: "Basket" },
  { valeur: "randonnee", libelle: "Randonnée" },
  { valeur: "padel", libelle: "Padel" },
  { valeur: "tennis", libelle: "Tennis" },
  { valeur: "natation", libelle: "Natation" },
  { valeur: "velo", libelle: "Vélo" },
  { valeur: "autre", libelle: "Autre" },
];

// "padel" -> "Padel" (undefined si le code est inconnu)
export function libelleDuSport(valeur) {
  return LISTE_DES_SPORTS.find((sport) => sport.valeur === valeur)?.libelle;
}