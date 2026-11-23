import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ChampFormulaire from "../components/ChampFormulaire";
import MiseEnPageAuthentification from "../components/MiseEnPageAuthentification";
import { reinitialiserMotDePasse } from "../api/utilisateurs";

export default function PageReinitialisation() {
  // L'adresse du lien : /reinitialisation-mot-de-passe?token=...&email=...
  const [parametresUrl] = useSearchParams();
  const jeton = parametresUrl.get("token");
  const email = parametresUrl.get("email");

  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreurs, setErreurs] = useState({});
  const [termine, setTermine] = useState(false);   // true = le mot de passe est changé
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function soumettre(evenementFormulaire) {
    evenementFormulaire.preventDefault();
    setErreurs({});
    setEnvoiEnCours(true);

    try {
      await reinitialiserMotDePasse({
        token: jeton,
        email: email,
        password: motDePasse,
        password_confirmation: confirmation,   // le nom "_confirmation" est imposé par la règle "confirmed"
      });
      setTermine(true);
    } catch (erreurCapturee) {
      const aDesErreursParChamp = Object.keys(erreurCapturee.erreurs ?? {}).length > 0;
      setErreurs(aDesErreursParChamp ? erreurCapturee.erreurs : { general: [erreurCapturee.message] });
    } finally {
      setEnvoiEnCours(false);
    }
  }

  // Lien incomplet (adresse tapée à la main, par exemple) : inutile d'afficher le formulaire
  const lienIncomplet = !jeton || !email;

  return (
    <MiseEnPageAuthentification image="/images/rencontre-randonnee.webp" legende="Photo : groupe en montagne">
      <div className="text-center">
        <div className="sous-titre">- nouveau départ -</div>
        <h1 className="mt-4 text-5xl">Nouveau mot de passe</h1>
      </div>

      <div className="mt-8 bg-ciel p-2.5 shadow-carte">
        <div className="bg-white p-8">
          {termine ? (
            <div className="text-center">
              <p className="font-bold text-marine">Mot de passe modifié. Tu peux te connecter.</p>
              <Link to="/connexion" className="bouton mt-6 w-full">Se connecter</Link>
            </div>
          ) : lienIncomplet ? (
            <div className="text-center">
              <p className="font-bold text-marine">Ce lien est incomplet.</p>
              <p className="mt-3 text-sm text-gris">Refais une demande depuis la page « Mot de passe oublié ».</p>
              <Link to="/mot-de-passe-oublie" className="bouton mt-6 w-full">Refaire une demande</Link>
            </div>
          ) : (
            <form onSubmit={soumettre}>
              <p className="mb-5 text-sm text-gris">Compte : <span className="font-bold text-marine">{email}</span></p>

              {/* Les erreurs de jeton (invalide ou expiré) arrivent sur la clé "email" : le champ n'est pas affiché ici, on les montre en haut */}
              {erreurs.email && <p className="mb-4 font-bold text-brand">{erreurs.email[0]}</p>}
              {erreurs.general && <p className="mb-4 font-bold text-brand">{erreurs.general[0]}</p>}

              <ChampFormulaire id="reinit-mot-de-passe" libelle="Nouveau mot de passe (8 caractères minimum)" type="password"
                valeur={motDePasse} auChangement={setMotDePasse} erreurs={erreurs.password} />
              <ChampFormulaire id="reinit-confirmation" libelle="Confirmer le mot de passe" type="password"
                valeur={confirmation} auChangement={setConfirmation} />

              <button type="submit" disabled={envoiEnCours} className="bouton mt-8 w-full disabled:opacity-50">
                {envoiEnCours ? "Enregistrement..." : "Enregistrer"}
              </button>

              {/* Si le lien est expiré, la personne peut en demander un nouveau */}
              {erreurs.email && (
                <p className="mt-4 text-center text-sm">
                  <Link to="/mot-de-passe-oublie" className="font-bold text-brand hover:underline">Demander un nouveau lien</Link>
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </MiseEnPageAuthentification>
  );
}