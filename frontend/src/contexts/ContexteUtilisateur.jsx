import { createContext, useContext, useEffect, useState } from "react";
import * as apiUtilisateurs from "../api/utilisateurs";

const ContexteUtilisateur = createContext(null);

export function FournisseurUtilisateur({ children }) {
  // L'utilisateur connecté (null = personne)
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

    // Remplace l'utilisateur gardé en mémoire (après une modification du profil)
  function mettreAJourUtilisateur(nouvelUtilisateur) {
    setUtilisateur(nouvelUtilisateur);
  }


  return (
    <ContexteUtilisateur.Provider
      value={{ utilisateur, chargementUtilisateur, seConnecter, sInscrire, seDeconnecter, mettreAJourUtilisateur }}
    >
      {children}
    </ContexteUtilisateur.Provider>
  );
}

export function useUtilisateur() {
  return useContext(ContexteUtilisateur);
}