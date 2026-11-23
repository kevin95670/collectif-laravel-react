import { useState } from "react";
import { Link } from "react-router-dom";
import ChampFormulaire from "../components/ChampFormulaire";
import MiseEnPageAuthentification from "../components/MiseEnPageAuthentification";
import { demanderLienReinitialisation } from "../api/utilisateurs";

export default function PageMotDePasseOublie() {
  const [email, setEmail] = useState("");
  const [erreurs, setErreurs] = useState({});
  const [messageEnvoye, setMessageEnvoye] = useState("");   // rempli = la demande est partie
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function soumettre(evenementFormulaire) {
    evenementFormulaire.preventDefault();
    setErreurs({});
    setEnvoiEnCours(true);

    try {
      const reponse = await demanderLienReinitialisation(email);
      setMessageEnvoye(reponse.message);   // le texte vient de Laravel
    } catch (erreurCapturee) {
      const aDesErreursParChamp = Object.keys(erreurCapturee.erreurs ?? {}).length > 0;
      setErreurs(aDesErreursParChamp ? erreurCapturee.erreurs : { general: [erreurCapturee.message] });
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <MiseEnPageAuthentification image="/images/sport-running.webp" legende="Photo : coureurs dans un parc">
      <div className="text-center">
        <div className="sous-titre">- pas de panique -</div>
        <h1 className="mt-4 text-5xl">Mot de passe oublié</h1>
        <p className="mt-4 text-sm leading-7 text-gris">
          Saisis l'adresse e-mail de ton compte : on t'envoie un lien pour choisir un nouveau mot de passe.
        </p>
      </div>

      <div className="mt-8 bg-ciel p-2.5 shadow-carte">
        <div className="bg-white p-8">
          {messageEnvoye ? (
            // La demande est partie : on affiche la confirmation à la place du formulaire
            <div className="text-center">
              <p className="font-bold text-marine">{messageEnvoye}</p>
              <p className="mt-3 text-sm text-gris">Le lien est valable une heure.</p>
            </div>
          ) : (
            <form onSubmit={soumettre}>
              {erreurs.general && <p className="mb-4 font-bold text-brand">{erreurs.general[0]}</p>}

              <ChampFormulaire id="oubli-email" libelle="E-mail" type="email"
                valeur={email} auChangement={setEmail} erreurs={erreurs.email} />

              <button type="submit" disabled={envoiEnCours} className="bouton mt-8 w-full disabled:opacity-50">
                {envoiEnCours ? "Envoi..." : "Envoyer le lien"}
              </button>
            </form>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-gris">
        <Link to="/connexion" className="font-bold text-brand hover:underline">Retour à la connexion</Link>
      </p>
    </MiseEnPageAuthentification>
  );
}