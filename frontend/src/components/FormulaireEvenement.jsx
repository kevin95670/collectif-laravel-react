import { useState } from "react";
import ChampFormulaire from "./ChampFormulaire";
import ChampSelection from "./ChampSelection";
import { LISTE_DES_SPORTS } from "../constantes/sports";

// Props :
// - valeursInitiales : les valeurs de départ des champs (vides pour une création, remplies pour une modification)
// - libelleBouton / libelleEnCours : les textes du bouton
// - auEnvoi : fonction fournie par le parent, appelée avec les données ; elle peut échouer (throw)
export default function FormulaireEvenement({ valeursInitiales, libelleBouton, libelleEnCours, auEnvoi }) {
  // useState ne lit sa valeur de départ qu'au PREMIER affichage du composant.
  const [titre, setTitre] = useState(valeursInitiales.titre);
  const [sport, setSport] = useState(valeursInitiales.sport);
  const [description, setDescription] = useState(valeursInitiales.description);
  const [adresse, setAdresse] = useState(valeursInitiales.adresse);
  const [ville, setVille] = useState(valeursInitiales.ville);
  const [dateDebut, setDateDebut] = useState(valeursInitiales.dateDebut);
  const [dateFin, setDateFin] = useState(valeursInitiales.dateFin);
  const [nombrePlacesMax, setNombrePlacesMax] = useState(valeursInitiales.nombrePlacesMax);

  const [erreurs, setErreurs] = useState({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function soumettreFormulaire(evenementFormulaire) {
    evenementFormulaire.preventDefault();
    setErreurs({});
    setEnvoiEnCours(true);

    try {
      // On passe les données (clés attendues par Laravel) au parent : lui sait quoi en faire
      await auEnvoi({
        titre: titre,
        sport: sport,
        description: description,
        adresse: adresse,
        ville: ville,
        date_debut: dateDebut,
        date_fin: dateFin,
        nombre_places_max: Number(nombrePlacesMax),
      });
    } catch (erreurCapturee) {
      const aDesErreursParChamp = Object.keys(erreurCapturee.erreurs ?? {}).length > 0;
      setErreurs(aDesErreursParChamp ? erreurCapturee.erreurs : { general: [erreurCapturee.message] });
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <form onSubmit={soumettreFormulaire} className="mt-10 border border-line bg-white p-8">
      {erreurs.general && <p className="mb-4 font-bold">{erreurs.general[0]}</p>}

      <ChampFormulaire id="titre" libelle="Titre" valeur={titre} auChangement={setTitre} erreurs={erreurs.titre} />
      <ChampSelection id="sport" libelle="Sport" options={LISTE_DES_SPORTS}
        valeur={sport} auChangement={setSport} erreurs={erreurs.sport} />
      <ChampFormulaire id="description" libelle="Description (facultatif)" multiligne
        valeur={description} auChangement={setDescription} erreurs={erreurs.description} />
      <ChampFormulaire id="adresse" libelle="Adresse" valeur={adresse} auChangement={setAdresse} erreurs={erreurs.adresse} />
      <ChampFormulaire id="ville" libelle="Ville" valeur={ville} auChangement={setVille} erreurs={erreurs.ville} />
      <ChampFormulaire id="date-debut" libelle="Début" type="datetime-local"
        valeur={dateDebut} auChangement={setDateDebut} erreurs={erreurs.date_debut} />
      <ChampFormulaire id="date-fin" libelle="Fin" type="datetime-local"
        valeur={dateFin} auChangement={setDateFin} erreurs={erreurs.date_fin} />
      <ChampFormulaire id="nombre-places" libelle="Nombre de places maximum" type="number"
        valeur={nombrePlacesMax} auChangement={setNombrePlacesMax} erreurs={erreurs.nombre_places_max} />

      <button type="submit" disabled={envoiEnCours} className="bouton mt-8 w-full text-center disabled:opacity-50">
        {envoiEnCours ? libelleEnCours : libelleBouton}
      </button>
    </form>
  );
}