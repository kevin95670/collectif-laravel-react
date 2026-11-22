import { Link } from "react-router-dom";
import CarteEvenement from "./CarteEvenement";
import { libelleDuSport } from "../constantes/sports";
import { formaterDate } from "../utilitaires/dates";

// La grille de cartes cliquables, utilisée par la recherche et par "Mes événements"
export default function GrilleEvenements({ evenements }) {
  return (
    <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {evenements.map((evenement) => (
        <li key={evenement.id}>
          {/* Toute la carte est le lien. Au survol elle se soulève ; "motion-reduce" désactive le mouvement si demandé. */}
          <Link
            to={"/evenements/" + evenement.id}
            className="block h-full transition duration-300 hover:-translate-y-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <CarteEvenement
              titre={evenement.titre}
              adresse={evenement.adresse + ", " + evenement.ville}
              dateDebut={formaterDate(evenement.date_debut)}
              nombrePlacesMax={evenement.nombre_places_max}
              inscrits={evenement.participants_count}
              annule={evenement.est_annule}
              photoUrl={evenement.photo_url}
              libelleSport={libelleDuSport(evenement.sport)}
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}