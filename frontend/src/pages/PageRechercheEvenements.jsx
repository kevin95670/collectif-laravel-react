import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ChampFormulaire from "../components/ChampFormulaire";
import ChampSelection from "../components/ChampSelection";
import { recupererEvenements } from "../api/evenements";
import { LISTE_DES_SPORTS } from "../constantes/sports";
import GrilleEvenements from "../components/GrilleEvenements";

// Même liste que pour la création, avec une première option "vide" pour ne pas filtrer
const OPTIONS_SPORTS_FILTRE = [{ valeur: "", libelle: "Tous les sports" }, ...LISTE_DES_SPORTS];

export default function PageRechercheEvenements() {
  // Les filtres de départ viennent de l'adresse : /evenements?sport=running&ville=Lyon&date=2026-12-05
  // setParametresUrl, lui, écrit dans l'adresse (comme setState, mais pour la partie après le "?").
  const [parametresUrl, setParametresUrl] = useSearchParams();

  // Les trois filtres. "" = pas de filtre.
  const [sport, setSport] = useState(parametresUrl.get("sport") ?? "");
  const [date, setDate] = useState(parametresUrl.get("date") ?? "");

  // La ville a deux valeurs : ce qui est tapé dans le champ (villeSaisie)
  // et ce qui est envoyé à l'API (ville), qui ne change qu'une fois la saisie terminée.
  const [villeSaisie, setVilleSaisie] = useState(parametresUrl.get("ville") ?? "");
  const [ville, setVille] = useState(villeSaisie);

  const [evenements, setEvenements] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  // Attendre 0,4 s après la dernière lettre avant d'appliquer la ville.
  // Le "return" annule le minuteur précédent : tant qu'on tape, rien ne part.
  useEffect(() => {
    const minuteur = setTimeout(() => setVille(villeSaisie), 400);
    return () => clearTimeout(minuteur);
  }, [villeSaisie]);

  // Écrire les filtres dans l'adresse. "replace: true" remplace l'adresse actuelle
  // au lieu d'en ajouter une dans l'historique (sinon "page précédente" repasserait par chaque lettre).
  useEffect(() => {
    const parametres = {};
    if (sport) parametres.sport = sport;
    if (ville) parametres.ville = ville;
    if (date) parametres.date = date;
    setParametresUrl(parametres, { replace: true });
  }, [sport, ville, date]);

  // Dépendances [sport, ville, date] : React relance l'effet dès que l'une des trois change.
  useEffect(() => {
    // Drapeau de sécurité : une vieille réponse, arrivée en retard, ne doit pas écraser la plus récente.
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

    return () => {
      ignorerCetteReponse = true;
    };
  }, [sport, ville, date]);

  function reinitialiserFiltres() {
    setSport("");
    setDate("");
    // On vide les deux valeurs de la ville : pas d'attente pour une réinitialisation
    setVilleSaisie("");
    setVille("");
  }

  const aucunResultat = !chargement && !erreur && evenements.length === 0;

  return (
    <>
      {/* Bandeau d'en-tête de la page */}
      <section className="border-b border-line bg-white px-6 py-16 text-center md:px-10">
        <div className="sous-titre apparition">- les sorties -</div>
        <h1 className="apparition mt-4 text-5xl leading-[1.05] md:text-6xl" style={{ animationDelay: "0.15s" }}>
          Trouver un événement
        </h1>
        <p className="texte-maj apparition mx-auto mt-5 max-w-xl text-xs" style={{ animationDelay: "0.3s" }}>
          Matchs, sorties et randonnées organisés près de chez toi : filtre par sport, par ville ou par date.
        </p>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-14 md:px-10">
        {/* Filtres : cadre ciel + intérieur blanc, comme les cartes */}
        <div className="bg-ciel p-2.5 shadow-carte">
          <div className="grid gap-4 bg-white p-6 md:grid-cols-4 md:items-end">
            <div>
              <ChampSelection id="filtre-sport" libelle="Sport" options={OPTIONS_SPORTS_FILTRE}
                valeur={sport} auChangement={setSport} />
            </div>
            <div>
              <ChampFormulaire id="filtre-ville" libelle="Ville" valeur={villeSaisie} auChangement={setVilleSaisie} />
            </div>
            <div>
              <ChampFormulaire id="filtre-date" libelle="Date" type="date" valeur={date} auChangement={setDate} />
            </div>
            <button type="button" onClick={reinitialiserFiltres} className="bouton-contour">
              Réinitialiser
            </button>
          </div>
        </div>

        <div className="mt-12">
          {erreur && <p className="text-center font-bold">{erreur}</p>}
          {chargement && <p className="text-center text-gris">Chargement...</p>}

          {/* Le nombre de résultats : "1 événement" ou "7 événements" */}
          {!chargement && !erreur && evenements.length > 0 && (
            <p className="mb-6 text-xs font-bold uppercase tracking-[.09em] text-brand">
              {evenements.length} {evenements.length > 1 ? "événements à venir" : "événement à venir"}
            </p>
          )}

          {aucunResultat && (
            <div className="border border-line bg-white px-6 py-14 text-center">
              <p className="font-titre text-3xl text-marine">Aucun événement pour cette recherche</p>
              <p className="mt-3 text-sm text-gris">Essaie un autre sport, une autre ville, ou lance le tien.</p>
              <Link to="/evenements/creer" className="bouton mt-6">Créer un événement</Link>
            </div>
          )}

          <GrilleEvenements evenements={evenements} />
        </div>
      </div>
    </>
  );
}