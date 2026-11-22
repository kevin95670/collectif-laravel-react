import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GrilleEvenements from "../components/GrilleEvenements";
import { recupererMesEvenements } from "../api/evenements";

// Un titre numéroté + une grille de cartes, ou un message si la liste est vide.
// Il sert deux fois dans la page : un composant évite de dupliquer le code.
function SectionEvenements({ numero, titre, evenements, messageVide, libelleLien, destinationLien }) {
  return (
    <section className="mt-14 first:mt-0">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line pb-3">
        <span className="numero">{numero}</span>
        <h2 className="text-4xl">{titre}</h2>
        <span className="ml-auto text-xs font-bold uppercase tracking-[.09em] text-brand">
          {evenements.length} {evenements.length > 1 ? "événements" : "événement"}
        </span>
      </div>

      {evenements.length === 0 ? (
        <div className="mt-6 border border-line bg-white px-6 py-10 text-center">
          <p className="text-sm text-gris">{messageVide}</p>
          <Link to={destinationLien} className="bouton-contour mt-5">{libelleLien}</Link>
        </div>
      ) : (
        <div className="mt-6">
          <GrilleEvenements evenements={evenements} />
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
    <>
      <section className="border-b border-line bg-white px-6 py-16 text-center md:px-10">
        <div className="sous-titre apparition">- mon espace -</div>
        <h1 className="apparition mt-4 text-5xl leading-[1.05] md:text-6xl" style={{ animationDelay: "0.15s" }}>
          Mes événements
        </h1>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-14 md:px-10">
        {chargement && <p className="text-center text-gris">Chargement...</p>}
        {erreur && <p className="text-center font-bold">{erreur}</p>}

        {!chargement && !erreur && (
          <>
            <SectionEvenements
              numero="01"
              titre="Je participe"
              evenements={evenementsInscrits}
              messageVide="Tu n'es inscrit à aucun événement pour l'instant."
              libelleLien="Trouver un événement"
              destinationLien="/evenements"
            />
            <SectionEvenements
              numero="02"
              titre="J'organise"
              evenements={evenementsOrganises}
              messageVide="Tu n'as pas encore créé d'événement."
              libelleLien="Créer un événement"
              destinationLien="/evenements/creer"
            />
          </>
        )}
      </div>
    </>
  );
}