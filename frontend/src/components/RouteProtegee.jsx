import { Navigate } from "react-router-dom";
import { useUtilisateur } from "../contexts/ContexteUtilisateur";

// Affiche la page demandée seulement si une personne est connectée.
export default function RouteProtegee({ children }) {
  const { utilisateur, chargementUtilisateur } = useUtilisateur();

  // On attend de savoir si la personne est connectée avant de décider.
  if (chargementUtilisateur) {
    return <p className="p-10 text-center">Chargement...</p>;
  }

  // Personne n'est connecté : redirection vers la page de connexion.
  // "replace" remplace l'entrée de l'historique, pour que le bouton "retour" ne fasse pas boucler.
  if (!utilisateur) {
    return <Navigate to="/connexion" replace />;
  }

  return children;
}