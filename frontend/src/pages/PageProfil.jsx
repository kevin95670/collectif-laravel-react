import { useState } from "react";
import ChampFormulaire from "../components/ChampFormulaire";
import { useUtilisateur } from "../contexts/ContexteUtilisateur";
import { modifierProfil, modifierMotDePasse } from "../api/utilisateurs";

// Premier bloc : nom et e-mail
function FormulaireInformations() {
  const { utilisateur, mettreAJourUtilisateur } = useUtilisateur();

  // Valeurs de départ : les informations actuelles
  const [nom, setNom] = useState(utilisateur.name);
  const [email, setEmail] = useState(utilisateur.email);

  const [erreurs, setErreurs] = useState({});
  const [message, setMessage] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function soumettre(evenementFormulaire) {
    evenementFormulaire.preventDefault();
    setErreurs({});
    setMessage("");
    setEnvoiEnCours(true);

    try {
      const utilisateurMisAJour = await modifierProfil({ name: nom, email: email });
      mettreAJourUtilisateur(utilisateurMisAJour);   // l'en-tête affiche aussitôt le nouveau nom
      setMessage("Informations enregistrées.");
    } catch (erreurCapturee) {
      const aDesErreursParChamp = Object.keys(erreurCapturee.erreurs ?? {}).length > 0;
      setErreurs(aDesErreursParChamp ? erreurCapturee.erreurs : { general: [erreurCapturee.message] });
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    // Cadre ciel + intérieur blanc, comme les cartes et le formulaire d'événement
    <form onSubmit={soumettre} className="mt-10 bg-ciel p-2.5 shadow-carte">
      <div className="bg-white p-8 md:p-10">
        <h2 className="border-b border-line pb-3 text-3xl">Mes informations</h2>
        {erreurs.general && <p className="mt-4 font-bold text-brand">{erreurs.general[0]}</p>}

        <div className="mt-6">
          <ChampFormulaire id="profil-nom" libelle="Nom" valeur={nom} auChangement={setNom} erreurs={erreurs.name} />
          <ChampFormulaire id="profil-email" libelle="E-mail" type="email" valeur={email} auChangement={setEmail} erreurs={erreurs.email} />
        </div>

        {message && <p className="mt-4 font-bold text-brand">{message}</p>}
        <button type="submit" disabled={envoiEnCours} className="bouton mt-6 w-full disabled:opacity-50">
          {envoiEnCours ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

// Second bloc : mot de passe
function FormulaireMotDePasse() {
  const [motDePasseActuel, setMotDePasseActuel] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const [erreurs, setErreurs] = useState({});
  const [message, setMessage] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function soumettre(evenementFormulaire) {
    evenementFormulaire.preventDefault();
    setErreurs({});
    setMessage("");
    setEnvoiEnCours(true);

    try {
      await modifierMotDePasse({
        mot_de_passe_actuel: motDePasseActuel,
        nouveau_mot_de_passe: nouveauMotDePasse,
        nouveau_mot_de_passe_confirmation: confirmation,   // le nom "_confirmation" est imposé par la règle "confirmed"
      });
      // On vide les champs : un mot de passe ne doit pas rester affiché
      setMotDePasseActuel("");
      setNouveauMotDePasse("");
      setConfirmation("");
      setMessage("Mot de passe modifié.");
    } catch (erreurCapturee) {
      const aDesErreursParChamp = Object.keys(erreurCapturee.erreurs ?? {}).length > 0;
      setErreurs(aDesErreursParChamp ? erreurCapturee.erreurs : { general: [erreurCapturee.message] });
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <form onSubmit={soumettre} className="mt-10 bg-ciel p-2.5 shadow-carte">
      <div className="bg-white p-8 md:p-10">
        <h2 className="border-b border-line pb-3 text-3xl">Mot de passe</h2>
        {erreurs.general && <p className="mt-4 font-bold text-brand">{erreurs.general[0]}</p>}

        <div className="mt-6">
          <ChampFormulaire id="mdp-actuel" libelle="Mot de passe actuel" type="password"
            valeur={motDePasseActuel} auChangement={setMotDePasseActuel} erreurs={erreurs.mot_de_passe_actuel} />
          <ChampFormulaire id="mdp-nouveau" libelle="Nouveau mot de passe (8 caractères minimum)" type="password"
            valeur={nouveauMotDePasse} auChangement={setNouveauMotDePasse} erreurs={erreurs.nouveau_mot_de_passe} />
          <ChampFormulaire id="mdp-confirmation" libelle="Confirmer le nouveau mot de passe" type="password"
            valeur={confirmation} auChangement={setConfirmation} />
        </div>

        {message && <p className="mt-4 font-bold text-brand">{message}</p>}
        <button type="submit" disabled={envoiEnCours} className="bouton mt-6 w-full disabled:opacity-50">
          {envoiEnCours ? "Enregistrement..." : "Changer le mot de passe"}
        </button>
      </div>
    </form>
  );
}

export default function PageProfil() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 md:px-10">
      <div className="text-center">
        <div className="sous-titre apparition">- mon espace -</div>
        <h1 className="apparition mt-4 text-5xl leading-[1.05] md:text-6xl" style={{ animationDelay: "0.15s" }}>
          Mon profil
        </h1>
      </div>

      <FormulaireInformations />
      <FormulaireMotDePasse />
    </div>
  );
}