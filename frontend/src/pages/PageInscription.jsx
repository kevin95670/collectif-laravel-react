import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ChampFormulaire from "../components/ChampFormulaire";
import MiseEnPageAuthentification from "../components/MiseEnPageAuthentification";
import { useUtilisateur } from "../contexts/ContexteUtilisateur";

export default function PageInscription() {
  const { sInscrire } = useUtilisateur();
  const naviguer = useNavigate();

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreurs, setErreurs] = useState({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function soumettre(evenementFormulaire) {
    evenementFormulaire.preventDefault();
    setErreurs({});
    setEnvoiEnCours(true);

    try {
      await sInscrire({
        name: nom,
        email: email,
        password: motDePasse,
        password_confirmation: confirmation,   // le nom "_confirmation" est imposé par la règle "confirmed" de Laravel
      });
      naviguer("/");
    } catch (erreurCapturee) {
      const aDesErreursParChamp = Object.keys(erreurCapturee.erreurs ?? {}).length > 0;
      setErreurs(aDesErreursParChamp ? erreurCapturee.erreurs : { general: [erreurCapturee.message] });
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <MiseEnPageAuthentification image="/images/accueil-apropos.webp" legende="Photo : groupe d'amis après l'effort">
      <div className="text-center">
        <div className="sous-titre">- bienvenue -</div>
        <h1 className="mt-4 text-5xl">Créer un compte</h1>
      </div>

      <form onSubmit={soumettre} className="mt-8 bg-ciel p-2.5 shadow-carte">
        <div className="bg-white p-8">
          {erreurs.general && <p className="mb-4 font-bold text-brand">{erreurs.general[0]}</p>}

          <ChampFormulaire id="inscription-nom" libelle="Nom"
            valeur={nom} auChangement={setNom} erreurs={erreurs.name} />
          <ChampFormulaire id="inscription-email" libelle="E-mail" type="email"
            valeur={email} auChangement={setEmail} erreurs={erreurs.email} />
          <ChampFormulaire id="inscription-mot-de-passe" libelle="Mot de passe (8 caractères minimum)" type="password"
            valeur={motDePasse} auChangement={setMotDePasse} erreurs={erreurs.password} />
          <ChampFormulaire id="inscription-confirmation" libelle="Confirmer le mot de passe" type="password"
            valeur={confirmation} auChangement={setConfirmation} />

          <button type="submit" disabled={envoiEnCours} className="bouton mt-8 w-full disabled:opacity-50">
            {envoiEnCours ? "Création..." : "Créer mon compte"}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gris">
        Déjà un compte ?{" "}
        <Link to="/connexion" className="font-bold text-brand hover:underline">Se connecter</Link>
      </p>
    </MiseEnPageAuthentification>
  );
}