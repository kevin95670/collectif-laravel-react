import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChampFormulaire from "../components/ChampFormulaire";
import ChampSelection from "../components/ChampSelection";
import { creerEvenement } from "../api/evenements";
import { LISTE_DES_SPORTS } from "../constantes/sports";

export default function PageCreationEvenement() {
  const [titre, setTitre] = useState("");
  const [sport, setSport] = useState("football");
  const [description, setDescription] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ville, setVille] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [nombrePlacesMax, setNombrePlacesMax] = useState("10");

  const [erreurs, setErreurs] = useState({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const naviguer = useNavigate();

  async function soumettreFormulaire(evenementFormulaire) {
    evenementFormulaire.preventDefault();
    setErreurs({});
    setEnvoiEnCours(true);

    try {
      // On envoie les clés que Laravel attend (celles de CreerEvenementRequete).
      // Number(...) convertit le texte du champ en nombre.
      await creerEvenement({
        titre: titre,
        sport: sport,
        description: description,
        adresse: adresse,
        ville: ville,
        date_debut: dateDebut,
        date_fin: dateFin,
        nombre_places_max: Number(nombrePlacesMax),
      });
      naviguer("/");   // créé : retour à la liste
    } catch (erreurCapturee) {
      const aDesErreursParChamp = Object.keys(erreurCapturee.erreurs ?? {}).length > 0;
      setErreurs(aDesErreursParChamp ? erreurCapturee.erreurs : { general: [erreurCapturee.message] });
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-10 py-16">
      <div className="text-center">
        <div className="sous-titre">- nouvel événement -</div>
        <h1 className="mt-4 text-5xl">Créer un événement</h1>
      </div>

      <form onSubmit={soumettreFormulaire} className="mt-10 border border-line bg-white p-8">
        {erreurs.general && <p className="mb-4 font-bold">{erreurs.general[0]}</p>}

        <ChampFormulaire id="titre" libelle="Titre" valeur={titre} auChangement={setTitre} erreurs={erreurs.titre} />
        <ChampSelection id="sport" libelle="Sport" options={LISTE_DES_SPORTS}
          valeur={sport} auChangement={setSport} erreurs={erreurs.sport} />
        <ChampFormulaire id="description" libelle="Description (facultatif)" multiligne
          valeur={description} auChangement={setDescription} erreurs={erreurs.description} />
        <ChampFormulaire id="adresse" libelle="Adresse" valeur={adresse} auChangement={setAdresse} erreurs={erreurs.adresse} />
        <ChampFormulaire id="ville" libelle="Ville" valeur={ville} auChangement={setVille} erreurs={erreurs.ville} />

        {/* type="datetime-local" : le navigateur affiche un sélecteur de date et d'heure */}
        <ChampFormulaire id="date-debut" libelle="Début" type="datetime-local"
          valeur={dateDebut} auChangement={setDateDebut} erreurs={erreurs.date_debut} />
        <ChampFormulaire id="date-fin" libelle="Fin" type="datetime-local"
          valeur={dateFin} auChangement={setDateFin} erreurs={erreurs.date_fin} />

        <ChampFormulaire id="nombre-places" libelle="Nombre de places maximum" type="number"
          valeur={nombrePlacesMax} auChangement={setNombrePlacesMax} erreurs={erreurs.nombre_places_max} />

        <button
          type="submit"
          disabled={envoiEnCours}
          className="bouton mt-8 w-full text-center disabled:opacity-50"
        >
          {envoiEnCours ? "Création..." : "Publier l'événement"}
        </button>
      </form>
    </div>
  );
}