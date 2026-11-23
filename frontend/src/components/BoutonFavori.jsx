import { useState } from "react";
import { ajouterFavori, retirerFavori } from "../api/favoris";

// Le cœur : contour = pas en favori, plein = en favori
function IconeCoeur({ rempli }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill={rempli ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// Props :
// - estFavoriInitial : l'état au chargement (donné par l'API)
// - auChangement(evenementId, estFavori) : facultatif, pour que le parent réagisse (retirer la carte d'une liste, par exemple)
// - avecTexte : bouton large avec un libellé (page de détail) au lieu de la petite pastille ronde (cartes)
export default function BoutonFavori({ evenementId, estFavoriInitial, auChangement, avecTexte = false, className = "" }) {
  const [estFavori, setEstFavori] = useState(estFavoriInitial);
  const [enCours, setEnCours] = useState(false);

  async function basculer() {
    const nouvelleValeur = !estFavori;

    // Mise à jour optimiste : le cœur change tout de suite, sans attendre le serveur
    setEstFavori(nouvelleValeur);
    setEnCours(true);

    try {
      if (nouvelleValeur) await ajouterFavori(evenementId);
      else await retirerFavori(evenementId);
      auChangement?.(evenementId, nouvelleValeur);
    } catch {
      setEstFavori(!nouvelleValeur);   // le serveur a refusé : on remet l'ancien état
    } finally {
      setEnCours(false);
    }
  }

  const classesForme = avecTexte
    ? "bouton-contour flex items-center justify-center gap-2"
    : "flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand shadow-carte transition hover:scale-110 motion-reduce:transition-none";

  return (
    // aria-pressed : les lecteurs d'écran annoncent un bouton "enfoncé" ou non
    <button
      type="button"
      onClick={basculer}
      disabled={enCours}
      aria-pressed={estFavori}
      aria-label={estFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={classesForme + " " + className}
    >
      <IconeCoeur rempli={estFavori} />
      {avecTexte && (estFavori ? "Dans mes favoris" : "Ajouter aux favoris")}
    </button>
  );
}