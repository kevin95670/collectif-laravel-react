import { useEffect, useState } from "react";
import CarteEvenement from "../components/CarteEvenement";
import ChampFormulaire from "../components/ChampFormulaire";
import ChampSelection from "../components/ChampSelection";
import { recupererEvenements } from "../api/evenements";
import { LISTE_DES_SPORTS } from "../constantes/sports";
import { formaterDate } from "../utilitaires/dates";
import { Link } from "react-router-dom";

// Même liste que pour la création, avec une première option "vide" pour ne pas filtrer
const OPTIONS_SPORTS_FILTRE = [{ valeur: "", libelle: "Tous les sports" }, ...LISTE_DES_SPORTS];

export default function PageRechercheEvenements() {
  // Les trois filtres. "" = pas de filtre.
  const [sport, setSport] = useState("");
  const [ville, setVille] = useState("");
  const [date, setDate] = useState("");

  const [evenements, setEvenements] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  // Dépendances [sport, ville, date] : React relance l'effet dès que l'une des trois change.
  useEffect(() => {
    // Drapeau de sécurité : si on tape vite, plusieurs requêtes partent.
    // Une vieille réponse, arrivée en retard, ne doit pas écraser la plus récente.
    let ignorerCetteReponse = false;

    setChargement(true);
    setErreur("");

    recupererEvenements({ sport, ville, date })
      .then((evenementsRecus) => {
        if (!ignorerCetteReponse) setEvenements(evenementsRecus);
      })
      .catch(() => {
        if (!ignorerCetteReponse) setErreur("Impossible de charger les événements.");
      })
      .finally(() => {
        if (!ignorerCetteReponse) setChargement(false);
      });

    // Nettoyage : React l'appelle juste avant de relancer l'effet (nouveau filtre)
    // ou quand on quitte la page. On "annule" la réponse de la requête précédente.
    return () => {
      ignorerCetteReponse = true;
    };
  }, [sport, ville, date]);

  function reinitialiserFiltres() {
    setSport("");
    setVille("");
    setDate("");
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:px-10">
      <div className="text-center">
        <div className="sous-titre">- les sorties -</div>
        <h1 className="mt-4 text-5xl">Trouver un événement</h1>
      </div>

      {/* Barre de filtres. Chaque champ est dans un <div> pour que les marges s'alignent. */}
      <div className="mt-10 grid gap-4 border border-line bg-white p-6 md:grid-cols-4 md:items-end">
        <div>
          <ChampSelection id="filtre-sport" libelle="Sport" options={OPTIONS_SPORTS_FILTRE}
            valeur={sport} auChangement={setSport} />
        </div>
        <div>
          <ChampFormulaire id="filtre-ville" libelle="Ville"
            valeur={ville} auChangement={setVille} />
        </div>
        <div>
          <ChampFormulaire id="filtre-date" libelle="Date" type="date"
            valeur={date} auChangement={setDate} />
        </div>
        <button type="button" onClick={reinitialiserFiltres} className="bouton text-center">
          Réinitialiser
        </button>
      </div>

      <div className="mt-10">
        {erreur && <p className="text-center font-bold">{erreur}</p>}
        {chargement && <p className="text-center">Chargement...</p>}

        {!chargement && !erreur && evenements.length === 0 && (
          <p className="text-center">Aucun événement ne correspond à ta recherche.</p>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {evenements.map((evenement) => (
            // key se met sur l'élément le plus extérieur du .map : ici, le Link
            <Link key={evenement.id} to={"/evenements/" + evenement.id}>
              <CarteEvenement
                titre={evenement.titre}
                adresse={`${evenement.adresse}, ${evenement.ville}`}
                dateDebut={formaterDate(evenement.date_debut)}
                nombrePlacesMax={evenement.nombre_places_max}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}