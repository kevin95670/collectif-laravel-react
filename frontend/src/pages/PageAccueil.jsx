import { useEffect, useState } from "react";
import CarteEvenement from "../components/CarteEvenement";
import { recupererEvenements } from "../api/evenements";

export default function PageAccueil() {
  const [evenements, setEvenements] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    recupererEvenements()
      .then((donnees) => setEvenements(donnees))
      .catch((erreurCapturee) => setErreur(erreurCapturee.message))
      .finally(() => setChargement(false));
  }, []);

  function formaterDate(dateTexte) {
    return new Date(dateTexte).toLocaleString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="mx-auto max-w-[1200px] px-10 py-16">
      <div className="text-center">
        <div className="sous-titre">- près de chez toi -</div>
        <h1 className="mt-4 text-5xl">Les prochains événements</h1>
      </div>

      {chargement && <p className="mt-10 text-center">Chargement...</p>}
      {erreur && <p className="mt-10 text-center font-bold">Impossible de charger les événements ({erreur})</p>}

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {evenements.map((evenement) => (
          <CarteEvenement
            key={evenement.id}
            titre={evenement.titre}
            adresse={evenement.adresse}
            dateDebut={formaterDate(evenement.date_debut)}
            nombrePlacesMax={evenement.nombre_places_max}
          />
        ))}
      </div>
    </div>
  );
}