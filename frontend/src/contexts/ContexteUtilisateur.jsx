import { createContext, useContext, useEffect, useState } from "react";
import * as apiUtilisateurs from "../api/utilisateurs";

// Crée la "boîte" de données. Elle est vide tant qu'aucun Fournisseur ne la remplit.
const ContexteUtilisateur = createContext(null);

// Le Fournisseur entoure l'application : tout ce qui est à l'intérieur peut lire la boîte.
// "children" : les composants placés entre <FournisseurUtilisateur> et </FournisseurUtilisateur>.
export function FournisseurUtilisateur({ children }) {
  // L'utilisateur connecté (null = personne), et un indicateur "on vérifie encore".
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargementUtilisateur, setChargementUtilisateur] = useState(true);

  // Au démarrage : on demande à Laravel qui est connecté.
  // Si le cookie de session est valide, il répond avec l'utilisateur ; sinon, erreur 401.
  useEffect(() => {
    apiUtilisateurs
      .recupererUtilisateurConnecte()
      .then((utilisateurRecu) => setUtilisateur(utilisateurRecu))
      .catch(() => setUtilisateur(null))                      // 401 = personne n'est connecté : normal
      .finally(() => setChargementUtilisateur(false));
  }, []);

  // Les fonctions qu'on met à disposition des composants.
  async function sInscrire(donnees) {
    const nouvelUtilisateur = await apiUtilisateurs.inscrire(donnees);
    setUtilisateur(nouvelUtilisateur);                        // Laravel connecte directement après l'inscription
  }

  async function seConnecter(identifiants) {
    const utilisateurConnecte = await apiUtilisateurs.connecter(identifiants);
    setUtilisateur(utilisateurConnecte);
  }

  async function seDeconnecter() {
    await apiUtilisateurs.deconnecter();
    setUtilisateur(null);
  }

  // "value" : tout ce que les composants pourront lire.
  return (
    <ContexteUtilisateur.Provider
      value={{ utilisateur, chargementUtilisateur, sInscrire, seConnecter, seDeconnecter }}
    >
      {children}
    </ContexteUtilisateur.Provider>
  );
}

// Le hook que les composants appelleront pour lire la boîte.
// Son nom doit commencer par "use" : c'est une règle de React pour les hooks (impossible de le mettre en français).
// eslint-disable-next-line react-refresh/only-export-components
export function useUtilisateur() {
  return useContext(ContexteUtilisateur);
}