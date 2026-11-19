import { useNavigate } from "react-router-dom";
import FormulaireEvenement from "../components/FormulaireEvenement";
import { creerEvenement } from "../api/evenements";

// Formulaire vide au départ (défini hors du composant : il ne change jamais)
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

  // Ce que le formulaire doit faire à l'envoi : créer, puis retourner à l'accueil
  async function creer(donnees) {
    await creerEvenement(donnees);
    naviguer("/");
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