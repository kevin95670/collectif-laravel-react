import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormulaireEvenement from "../components/FormulaireEvenement";
import { useUtilisateur } from "../contexts/ContexteUtilisateur";
import { modifierEvenement, recupererEvenement, supprimerPhotoEvenement, televerserPhoto } from "../api/evenements";
import { versChampDateHeure } from "../utilitaires/dates";

export default function PageModificationEvenement() {
  const { id } = useParams();
  const { utilisateur } = useUtilisateur();
  const naviguer = useNavigate();

  const [evenement, setEvenement] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  useEffect(() => {
    recupererEvenement(id)
      .then(setEvenement)
      .catch(() => setErreur("Impossible de charger l'événement."))
      .finally(() => setChargement(false));
  }, [id]);

  // Ce que le formulaire doit faire à l'envoi : enregistrer, gérer la photo, puis revenir sur la page de l'événement
  async function enregistrer(donnees, optionsPhoto) {
    await modifierEvenement(id, donnees);

    if (optionsPhoto.photo) {
      await televerserPhoto(id, optionsPhoto.photo);          // nouvelle photo : remplace l'ancienne
    } else if (optionsPhoto.supprimerPhoto) {
      await supprimerPhotoEvenement(id);                      // case cochée : on retire la photo
    }

    naviguer("/evenements/" + id);
  }

  if (chargement) return <p className="p-10 text-center">Chargement...</p>;
  if (erreur) return <p className="p-10 text-center font-bold">{erreur}</p>;

  // Le serveur refuserait de toute façon (Policy), mais on évite d'afficher un formulaire inutile
  if (evenement.organisateur_id !== utilisateur.id || evenement.est_annule) {
    return <p className="p-10 text-center font-bold">Tu ne peux pas modifier cet événement.</p>;
  }

  // Les valeurs de départ viennent de l'événement chargé.
  // description peut être null : "?? ''" met un texte vide à la place (un champ ne veut pas de null).
  const valeursInitiales = {
    titre: evenement.titre,
    sport: evenement.sport,
    description: evenement.description ?? "",
    adresse: evenement.adresse,
    ville: evenement.ville,
    dateDebut: versChampDateHeure(evenement.date_debut),
    dateFin: versChampDateHeure(evenement.date_fin),
    nombrePlacesMax: String(evenement.nombre_places_max),
  };

  return (
    <div className="mx-auto max-w-xl px-10 py-16">
      <div className="text-center">
        <div className="sous-titre">- modification -</div>
        <h1 className="mt-4 text-5xl">Modifier l'événement</h1>
      </div>

      <FormulaireEvenement
        valeursInitiales={valeursInitiales}
        photoActuelleUrl={evenement.photo_url}
        libelleBouton="Enregistrer les modifications"
        libelleEnCours="Enregistrement..."
        auEnvoi={enregistrer}
      />
    </div>
  );
}