import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUtilisateur } from "../contexts/ContexteUtilisateur";
import ChampFormulaire from "../components/ChampFormulaire";

export default function PageConnexion() {
  // Un state par champ du formulaire (équivalent des variables liées par v-model).
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");

  // Les erreurs renvoyées par Laravel : { email: ["..."], password: ["..."] }
  const [erreurs, setErreurs] = useState({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  // seConnecter vient du contexte (étape 12). useNavigate permet de changer de page par le code.
  const { seConnecter } = useUtilisateur();
  const naviguer = useNavigate();

  async function soumettreFormulaire(evenementFormulaire) {
    // Empêche le navigateur de recharger la page (comportement par défaut d'un formulaire HTML),
    // comme @submit.prevent en Vue.
    evenementFormulaire.preventDefault();

    setErreurs({});
    setEnvoiEnCours(true);

    try {
      // Laravel attend les clés "email" et "password".
      await seConnecter({ email: email, password: motDePasse });
      naviguer("/");   // connexion réussie : retour à l'accueil
    } catch (erreurCapturee) {
      // Erreur de validation (422) : on garde les messages par champ.
      // Autre erreur (réseau, 500...) : on affiche un message général.
      const aDesErreursParChamp = Object.keys(erreurCapturee.erreurs ?? {}).length > 0;
      setErreurs(aDesErreursParChamp ? erreurCapturee.erreurs : { general: [erreurCapturee.message] });
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-10">
      <h1 className="text-4xl font-medium">Se connecter</h1>

      <form onSubmit={soumettreFormulaire} className="bg-white p-8 border border-line">
        {erreurs.general && <p className="mb-4 font-bold">{erreurs.general[0]}</p>}

        <ChampFormulaire
          id="email"
          libelle="Email"
          type="email"
          valeur={email}
          auChangement={setEmail}
          erreurs={erreurs.email}
        />

        <ChampFormulaire
          id="mot-de-passe"
          libelle="Mot de passe"
          type="password"
          valeur={motDePasse}
          auChangement={setMotDePasse}
          erreurs={erreurs.password}
        />

        <button
          type="submit"
          disabled={envoiEnCours}
          className="bouton mt-6 w-full text-center disabled:opacity-50"
        >
          {envoiEnCours ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="mt-6">
        Pas encore de compte ? <Link to="/inscription" className="font-bold text-brand underline">S'inscrire</Link>
      </p>
    </div>
  );
}