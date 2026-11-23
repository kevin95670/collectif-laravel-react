import { useEffect, useRef, useState } from "react";

// API Adresse du gouvernement : gratuite, sans clé, appelable depuis le navigateur
const URL_RECHERCHE_ADRESSE = "https://api-adresse.data.gouv.fr/search/";

// Props :
// - valeur / auChangement : le texte du champ, comme pour ChampFormulaire
// - auChoix({ adresse, ville }) : appelée quand on clique sur une suggestion
export default function ChampAdresse({ id, libelle, valeur, auChangement, auChoix, erreurs }) {
  const [suggestions, setSuggestions] = useState([]);
  const [listeOuverte, setListeOuverte] = useState(false);

  // Vrai seulement quand c'est l'utilisateur qui tape. Ainsi on ne lance pas de recherche
  // à l'ouverture d'un formulaire de modification, ni juste après avoir choisi une suggestion.
  // Une ref garde sa valeur sans provoquer de nouvel affichage (contrairement à un state).
  const saisieParUtilisateur = useRef(false);
  const conteneur = useRef(null);

  // Recherche des suggestions, 300 ms après la dernière frappe
  useEffect(() => {
    if (!saisieParUtilisateur.current || valeur.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    let ignorerCetteReponse = false;

    const minuteur = setTimeout(async () => {
      try {
        const parametres = new URLSearchParams({ q: valeur, limit: "5", autocomplete: "1" });
        const reponse = await fetch(`${URL_RECHERCHE_ADRESSE}?${parametres}`);
        const donnees = await reponse.json();

        if (ignorerCetteReponse) return;   // une frappe plus récente a déjà relancé une recherche

        // On écarte les résultats "commune" : on cherche une adresse, pas une ville entière
        const adresses = donnees.features.filter((element) => element.properties.type !== "municipality");
        setSuggestions(adresses);
      } catch {
        // Les suggestions sont un confort : si l'API ne répond pas, on peut toujours taper à la main
        if (!ignorerCetteReponse) setSuggestions([]);
      }
    }, 300);

    // Nettoyage : à chaque nouvelle frappe, on annule le minuteur et on ignore l'ancienne réponse
    return () => {
      clearTimeout(minuteur);
      ignorerCetteReponse = true;
    };
  }, [valeur]);

  // Un clic en dehors du champ ferme la liste
  useEffect(() => {
    function fermerSiClicEnDehors(evenement) {
      if (conteneur.current && !conteneur.current.contains(evenement.target)) {
        setListeOuverte(false);
      }
    }
    document.addEventListener("mousedown", fermerSiClicEnDehors);
    return () => document.removeEventListener("mousedown", fermerSiClicEnDehors);
  }, []);

  function enTapant(evenement) {
    saisieParUtilisateur.current = true;
    auChangement(evenement.target.value);
    setListeOuverte(true);
  }

  function choisir(suggestion) {
    saisieParUtilisateur.current = false;
    auChoix({ adresse: suggestion.properties.name, ville: suggestion.properties.city });
    setSuggestions([]);
    setListeOuverte(false);
  }

  const afficherListe = listeOuverte && suggestions.length > 0;

  return (
    // relative : la liste est positionnée par rapport à ce bloc
    <div ref={conteneur} className="relative mt-5 first:mt-0">
      <label className="block text-xs font-bold uppercase tracking-[.09em] text-marine" htmlFor={id}>{libelle}</label>

      <input
        id={id}
        type="text"
        value={valeur}
        onChange={enTapant}
        onKeyDown={(evenement) => evenement.key === "Escape" && setListeOuverte(false)}
        autoComplete="off"   // sinon le navigateur ajoute ses propres suggestions par-dessus
        aria-autocomplete="list"
        aria-expanded={afficherListe}
        className="mt-2 w-full border border-line bg-white px-4 py-3 text-sm text-marine focus:border-brand"
      />

      {afficherListe && (
        <ul role="listbox" className="absolute left-0 right-0 z-20 border border-line bg-white shadow-carte">
          {suggestions.map((suggestion) => (
            <li key={suggestion.properties.id} role="option">
              <button
                type="button"
                onClick={() => choisir(suggestion)}
                className="block w-full px-4 py-3 text-left text-sm text-marine hover:bg-ciel"
              >
                {suggestion.properties.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      {erreurs && <p className="mt-1 text-sm font-bold text-brand">{erreurs[0]}</p>}
    </div>
  );
}