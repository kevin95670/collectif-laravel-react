import { useEffect, useState } from "react";
import ChampFormulaire from "./ChampFormulaire";
import ChampSelection from "./ChampSelection";
import PhotoEvenement from "./PhotoEvenement";
import { LISTE_DES_SPORTS } from "../constantes/sports";

// Le titre numéroté d'une rubrique du formulaire : "01  L'événement"
function TitreRubrique({ numero, texte, premiere = false }) {
  return (
    <div className={"flex items-baseline gap-3 border-b border-line pb-3 " + (premiere ? "" : "mt-10")}>
      <span className="numero">{numero}</span>
      <h2 className="text-2xl">{texte}</h2>
    </div>
  );
}

// Props :
// - valeursInitiales : valeurs de départ des champs
// - photoActuelleUrl : photo déjà enregistrée (modification), sinon rien
// - auEnvoi(donnees, optionsPhoto) : fournie par le parent ; optionsPhoto = { photo, supprimerPhoto }
export default function FormulaireEvenement({ valeursInitiales, photoActuelleUrl = null, libelleBouton, libelleEnCours, auEnvoi }) {
  const [titre, setTitre] = useState(valeursInitiales.titre);
  const [sport, setSport] = useState(valeursInitiales.sport);
  const [description, setDescription] = useState(valeursInitiales.description);
  const [adresse, setAdresse] = useState(valeursInitiales.adresse);
  const [ville, setVille] = useState(valeursInitiales.ville);
  const [dateDebut, setDateDebut] = useState(valeursInitiales.dateDebut);
  const [dateFin, setDateFin] = useState(valeursInitiales.dateFin);
  const [nombrePlacesMax, setNombrePlacesMax] = useState(valeursInitiales.nombrePlacesMax);

  const [photo, setPhoto] = useState(null);                      // le fichier choisi (objet File) ou null
  const [apercuPhoto, setApercuPhoto] = useState(null);          // adresse temporaire pour l'aperçu
  const [supprimerPhoto, setSupprimerPhoto] = useState(false);   // case "supprimer la photo actuelle"

  const [erreurs, setErreurs] = useState({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  // À chaque nouveau fichier choisi, on fabrique une adresse temporaire pour l'afficher avant l'envoi.
  useEffect(() => {
    if (!photo) {
      setApercuPhoto(null);
      return;
    }
    // createObjectURL : une adresse "blob:..." qui pointe vers le fichier en mémoire du navigateur
    const adresseTemporaire = URL.createObjectURL(photo);
    setApercuPhoto(adresseTemporaire);

    // Nettoyage : on libère la mémoire quand le fichier change ou quand le composant disparaît
    return () => URL.revokeObjectURL(adresseTemporaire);
  }, [photo]);

  // Que montrer ? Le nouvel aperçu d'abord, sinon la photo actuelle (sauf si on veut la supprimer)
  const urlAffichee = apercuPhoto ?? (supprimerPhoto ? null : photoActuelleUrl);

  async function soumettreFormulaire(evenementFormulaire) {
    evenementFormulaire.preventDefault();
    setErreurs({});
    setEnvoiEnCours(true);

    try {
      await auEnvoi(
        {
          titre: titre,
          sport: sport,
          description: description,
          adresse: adresse,
          ville: ville,
          date_debut: dateDebut,
          date_fin: dateFin,
          nombre_places_max: Number(nombrePlacesMax),
        },
        { photo: photo, supprimerPhoto: supprimerPhoto }
      );
    } catch (erreurCapturee) {
      const aDesErreursParChamp = Object.keys(erreurCapturee.erreurs ?? {}).length > 0;
      setErreurs(aDesErreursParChamp ? erreurCapturee.erreurs : { general: [erreurCapturee.message] });
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <form onSubmit={soumettreFormulaire} className="mt-10 bg-ciel p-2.5 shadow-carte">
      <div className="bg-white p-8 md:p-10">
        {erreurs.general && <p className="mb-6 font-bold text-brand">{erreurs.general[0]}</p>}

        <TitreRubrique numero="01" texte="L'événement" premiere />
        <div className="mt-6">
          <ChampFormulaire id="titre" libelle="Titre" valeur={titre} auChangement={setTitre} erreurs={erreurs.titre} />
          <ChampSelection id="sport" libelle="Sport" options={LISTE_DES_SPORTS}
            valeur={sport} auChangement={setSport} erreurs={erreurs.sport} />
          <ChampFormulaire id="description" libelle="Description (facultatif)" multiligne
            valeur={description} auChangement={setDescription} erreurs={erreurs.description} />
        </div>

        <TitreRubrique numero="02" texte="Le lieu" />
        {/* Deux colonnes dès la taille tablette. Chaque champ est dans un <div> pour que les marges s'alignent. */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <ChampFormulaire id="adresse" libelle="Adresse" valeur={adresse} auChangement={setAdresse} erreurs={erreurs.adresse} />
          </div>
          <div>
            <ChampFormulaire id="ville" libelle="Ville" valeur={ville} auChangement={setVille} erreurs={erreurs.ville} />
          </div>
        </div>

        <TitreRubrique numero="03" texte="Les horaires et les places" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <ChampFormulaire id="date-debut" libelle="Début" type="datetime-local"
              valeur={dateDebut} auChangement={setDateDebut} erreurs={erreurs.date_debut} />
          </div>
          <div>
            <ChampFormulaire id="date-fin" libelle="Fin" type="datetime-local"
              valeur={dateFin} auChangement={setDateFin} erreurs={erreurs.date_fin} />
          </div>
          <div>
            <ChampFormulaire id="nombre-places" libelle="Nombre de places maximum" type="number"
              valeur={nombrePlacesMax} auChangement={setNombrePlacesMax} erreurs={erreurs.nombre_places_max} />
          </div>
        </div>

        <TitreRubrique numero="04" texte="La photo" />
        <div className="mt-6">
          <label className="block text-xs font-bold uppercase tracking-[.09em] text-marine" htmlFor="photo">
            Photo (facultatif)
          </label>
          <PhotoEvenement url={urlAffichee} alt="Aperçu" className="mt-2 h-56 w-full rounded-tr-[96px]" />

          {/* Un champ fichier n'est jamais "contrôlé" par value : on lit le fichier choisi dans l'événement.
              Le modificateur "file:" stylise le bouton « Parcourir » intégré au champ. */}
          <input
            id="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(evenement) => setPhoto(evenement.target.files[0] ?? null)}
            className="mt-3 block w-full text-sm text-gris file:mr-4 file:cursor-pointer file:border file:border-marine file:bg-transparent file:px-5 file:py-3 file:text-xs file:font-bold file:uppercase file:tracking-[.14em] file:text-marine hover:file:bg-ciel"
          />

          {photoActuelleUrl && !photo && (
            <label className="mt-3 flex items-center gap-2 text-sm text-marine">
              <input type="checkbox" checked={supprimerPhoto} onChange={(evenement) => setSupprimerPhoto(evenement.target.checked)} />
              Supprimer la photo actuelle
            </label>
          )}

          {erreurs.photo && <p className="mt-1 text-sm font-bold text-brand">{erreurs.photo[0]}</p>}
        </div>

        <button type="submit" disabled={envoiEnCours} className="bouton mt-10 w-full disabled:opacity-50">
          {envoiEnCours ? libelleEnCours : libelleBouton}
        </button>
      </div>
    </form>
  );
}