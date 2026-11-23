import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ChampFormulaire from "../components/ChampFormulaire";
import MiseEnPageAuthentification from "../components/MiseEnPageAuthentification";
import { useUtilisateur } from "../contexts/ContexteUtilisateur";

export default function PageConnexion() {
  const { seConnecter } = useUtilisateur();
  const naviguer = useNavigate();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreurs, setErreurs] = useState({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function soumettre(evenementFormulaire) {
    evenementFormulaire.preventDefault();
    setErreurs({});
    setEnvoiEnCours(true);

    try {
      await seConnecter({ email: email, password: motDePasse });
      naviguer("/");
    } catch (erreurCapturee) {
      const aDesErreursParChamp = Object.keys(erreurCapturee.erreurs ?? {}).length > 0;
      setErreurs(aDesErreursParChamp ? erreurCapturee.erreurs : { general: [erreurCapturee.message] });
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <MiseEnPageAuthentification image="/images/accueil-presentation.webp" legende="Photo : équipe qui se félicite après un match">
      <div className="text-center">
        <div className="sous-titre">- bon retour -</div>
        <h1 className="mt-4 text-5xl">Se connecter</h1>
      </div>

      <form onSubmit={soumettre} className="mt-8 bg-ciel p-2.5 shadow-carte">
        <div className="bg-white p-8">
          {erreurs.general && <p className="mb-4 font-bold text-brand">{erreurs.general[0]}</p>}

          <ChampFormulaire id="connexion-email" libelle="E-mail" type="email"
            valeur={email} auChangement={setEmail} erreurs={erreurs.email} />
          <ChampFormulaire id="connexion-mot-de-passe" libelle="Mot de passe" type="password"
            valeur={motDePasse} auChangement={setMotDePasse} erreurs={erreurs.password} />
          <p className="mt-3 text-right text-xs">
            <Link to="/mot-de-passe-oublie" className="font-bold text-brand hover:underline">Mot de passe oublié ?</Link>
          </p>

          <button type="submit" disabled={envoiEnCours} className="bouton mt-8 w-full disabled:opacity-50">
            {envoiEnCours ? "Connexion..." : "Se connecter"}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gris">
        Pas encore de compte ?{" "}
        <Link to="/inscription" className="font-bold text-brand hover:underline">Créer un compte</Link>
      </p>
    </MiseEnPageAuthentification>
  );
}