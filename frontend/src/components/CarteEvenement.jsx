import PhotoEvenement from "./PhotoEvenement";

// "01,9 km" : une virgule à la française, et "moins de 1 km" en dessous du kilomètre
function formaterDistance(distanceKm) {
  if (distanceKm < 1) return "à moins de 1 km";
  return "à " + distanceKm.toFixed(1).replace(".", ",") + " km";
}

// "inscrits" et "distanceKm" sont facultatifs : sans eux, on n'affiche rien de plus.
export default function CarteEvenement({ titre, adresse, dateDebut, nombrePlacesMax, inscrits, annule = false, photoUrl, libelleSport, distanceKm }) {
  let lignePlaces = nombrePlacesMax + " places";
  if (inscrits !== undefined) {
    // "Complet" est écrit en toutes lettres : l'information ne passe pas par la seule couleur
    lignePlaces = inscrits >= nombrePlacesMax ? "Complet" : inscrits + " sur " + nombrePlacesMax + " inscrits";
  }
  // Un événement annulé l'emporte sur tout le reste
  if (annule) lignePlaces = "Annulé";

  return (
    // Cadre ciel + intérieur blanc ; h-full : la carte remplit toute la hauteur de sa case de grille
    <article className="h-full bg-ciel p-3 shadow-carte">
      <div className="flex h-full flex-col bg-white">
        {/* Hauteur fixe : toutes les cartes ont la même zone photo, avec ou sans image */}
        <PhotoEvenement url={photoUrl} alt={titre} className="h-48 w-full rounded-t-[96px]" />

        <div className="flex flex-1 flex-col p-6">
          {libelleSport && <p className="sous-titre">- {libelleSport} -</p>}
          <h3 className="mt-2 text-3xl leading-tight">{titre}</h3>
          <p className="mt-3 text-sm text-gris">{adresse}</p>
          <p className="mt-1 text-sm text-gris">{dateDebut}</p>
          {/* != null : vrai pour 0, faux pour null et undefined (pas de position, ou adresse sans coordonnées) */}
          {distanceKm != null && <p className="mt-1 text-sm font-bold text-marine">{formaterDistance(distanceKm)}</p>}

          {/* mt-auto : ce bloc se colle en bas de la carte, quelle que soit la longueur du titre */}
          <div className="mt-auto pt-5">
            <p className="border-t border-line pt-4 text-xs font-bold uppercase tracking-[.09em] text-brand">
              {lignePlaces}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}