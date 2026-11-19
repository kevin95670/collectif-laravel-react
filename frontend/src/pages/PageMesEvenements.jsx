import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CarteEvenement from "../components/CarteEvenement";
import { recupererMesEvenements } from "../api/evenements";
import { formaterDate } from "../utilitaires/dates";

// Un titre + une grille de cartes cliquables, ou un message si la liste est vide.
// Il sert deux fois dans la page : un composant évite de dupliquer le code.
function SectionEvenements({ titre, evenements, messageVide }) {
  return (
    <section className="mt-12">
      <h2 className="text-3xl">{titre}</h2>

      {evenements.length === 0 ? (
        <p className="mt-4 text-gris">{messageVide}</p>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {evenements.map((evenement) => (
            <Link key={evenement.id} to={"/evenements/" + evenement.id}>
              <CarteEvenement
                titre={evenement.titre}
                adresse={evenement.adresse + ", " + evenement.ville}
                dateDebut={formaterDate(evenement.date_debut)}
                nombrePlacesMax={evenement.nombre_places_max}
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default function PageMesEvenements() {
  const [evenementsOrganises, setEvenementsOrganises] = useState([]);
  const [evenementsInscrits, setEvenementsInscrits] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    recupererMesEvenements()
      .then((donnees) => {
        setEvenementsOrganises(donnees.organises);
        setEvenementsInscrits(donnees.inscrits);
      })
      .catch(() => setErreur("Impossible de charger tes événements."))
      .finally(() => setChargement(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:px-10">
      <div className="text-center">
        <div className="sous-titre">- mon espace -</div>
        <h1 className="mt-4 text-5xl">Mes événements</h1>
      </div>

      {chargement && <p className="mt-10 text-center">Chargement...</p>}
      {erreur && <p className="mt-10 text-center font-bold">{erreur}</p>}

      {!chargement && !erreur && (
        <>
          <SectionEvenements
            titre="Je participe"
            evenements={evenementsInscrits}
            messageVide="Tu n'es inscrit à aucun événement pour l'instant."
          />
          <SectionEvenements
            titre="J'organise"
            evenements={evenementsOrganises}
            messageVide="Tu n'as pas encore créé d'événement."
          />
        </>
      )}
    </div>
  );
}