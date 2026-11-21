import PhotoEvenement from "./PhotoEvenement";

export default function CarteEvenement({ titre, adresse, dateDebut, nombrePlacesMax, photoUrl, libelleSport }) {
  return (
    // Cadre ciel + intérieur blanc ; h-full : la carte remplit toute la hauteur de sa case de grille
    <article className="h-full bg-ciel p-3 shadow-carte">
      <div className="flex h-full flex-col bg-white">
        {/* Hauteur fixe : toutes les cartes ont la même zone photo, avec ou sans image */}
        <PhotoEvenement url={photoUrl} alt={titre} className="h-48 w-full rounded-t-[96px]" />

        <div className="flex flex-1 flex-col p-6">
          {libelleSport && <p className="sous-titre">- {libelleSport} -</p>}
          <h3 className="mt-2 text-3xl">{titre}</h3>
          <p className="mt-2 text-sm text-gris">{adresse}</p>
          <p className="mt-1 text-sm text-gris">{dateDebut}</p>
          {/* mt-auto : la ligne des places se colle en bas de la carte */}
          <p className="mt-auto pt-4 font-bold text-brand">{nombrePlacesMax} places</p>
        </div>
      </div>
    </article>
  );
}