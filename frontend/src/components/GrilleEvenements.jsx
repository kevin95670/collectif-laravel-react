import { Link } from "react-router-dom";
import CarteEvenement from "./CarteEvenement";
import { useUtilisateur } from "../contexts/ContexteUtilisateur";
import { libelleDuSport } from "../constantes/sports";
import { formaterDate } from "../utilitaires/dates";
import BoutonFavori from "./BoutonFavori";

// La grille de cartes cliquables, utilisée par la recherche et par "Mes événements".
// auChangementFavori : facultatif, appelée quand on clique sur un cœur.
export default function GrilleEvenements({ evenements, auChangementFavori }) {
  const { utilisateur } = useUtilisateur();

  // Le cœur n'apparaît que pour les personnes connectées, sur les événements des autres,
  // et seulement si l'API a indiqué l'état (est_favori absent = liste où le cœur n'a pas de sens)
  function peutMettreEnFavori(evenement) {
    return utilisateur && evenement.est_favori !== undefined && evenement.organisateur_id !== utilisateur.id;
  }

  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {evenements.map((evenement) => (
        // relative : le cœur est positionné par rapport à cette case.
        // Au survol la carte se soulève ; "motion-reduce" désactive le mouvement si demandé.
        <li
          key={evenement.id}
          className="relative transition duration-300 hover:-translate-y-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          <Link to={"/evenements/" + evenement.id} className="block h-full">
            <CarteEvenement
              titre={evenement.titre}
              adresse={evenement.adresse + ", " + evenement.ville}
              dateDebut={formaterDate(evenement.date_debut)}
              nombrePlacesMax={evenement.nombre_places_max}
              inscrits={evenement.participants_count}
              annule={evenement.est_annule}
              photoUrl={evenement.photo_url}
              libelleSport={libelleDuSport(evenement.sport)}
              distanceKm={evenement.distance_km}
            />
          </Link>

          {peutMettreEnFavori(evenement) && (
            <BoutonFavori
              evenementId={evenement.id}
              estFavoriInitial={evenement.est_favori}
              auChangement={auChangementFavori}
              className="absolute right-8 top-14"
            />
          )}
        </li>
      ))}
    </ul>
  );
}