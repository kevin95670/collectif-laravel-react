import { useNavigate } from "react-router-dom";
import FormulaireEvenement from "../components/FormulaireEvenement";
import { creerEvenement, televerserPhoto } from "../api/evenements";

const VALEURS_INITIALES = {
  titre: "",
  sport: "football",
  description: "",
  adresse: "",
  ville: "",
  dateDebut: "",
  dateFin: "",
  nombrePlacesMax: "10",
};

export default function PageCreationEvenement() {
  const naviguer = useNavigate();

  async function creer(donnees, optionsPhoto) {
    // 1. On crée l'événement : la réponse contient son id
    const evenementCree = await creerEvenement(donnees);

    // 2. S'il y a une photo, on l'envoie ensuite (c'est une requête à part côté Laravel)
    if (optionsPhoto.photo) {
      try {
        await televerserPhoto(evenementCree.id, optionsPhoto.photo);
      } catch {
        // L'événement existe déjà : on ne recrée rien. On va sur sa page de modification,
        // pour que la personne puisse réessayer d'ajouter la photo.
        naviguer("/evenements/" + evenementCree.id + "/modifier");
        return;
      }
    }

    naviguer("/evenements/" + evenementCree.id);   // on arrive directement sur la page de l'événement créé
  }

  return (
    <div className="mx-auto max-w-xl px-10 py-16">
      <div className="text-center">
        <div className="sous-titre">- nouvel événement -</div>
        <h1 className="mt-4 text-5xl">Créer un événement</h1>
      </div>

      <FormulaireEvenement
        valeursInitiales={VALEURS_INITIALES}
        libelleBouton="Publier l'événement"
        libelleEnCours="Création..."
        auEnvoi={creer}
      />
    </div>
  );
}