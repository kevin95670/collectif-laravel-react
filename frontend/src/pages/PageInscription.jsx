import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ChampFormulaire from "../components/ChampFormulaire";
import { useUtilisateur } from "../contexts/ContexteUtilisateur";

export default function PageInscription() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreurs, setErreurs] = useState({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const { sInscrire } = useUtilisateur();
  const naviguer = useNavigate();

  async function soumettreFormulaire(evenementFormulaire) {
    evenementFormulaire.preventDefault();
    setErreurs({});
    setEnvoiEnCours(true);

    try {
      // Laravel attend les clés "name", "email" et "password" (voir inscrire() côté Laravel).
      await sInscrire({ name: nom, email: email, password: motDePasse });
      naviguer("/");   // l'inscription connecte directement : retour à l'accueil
    } catch (erreurCapturee) {
      const aDesErreursParChamp = Object.keys(erreurCapturee.erreurs ?? {}).length > 0;
      setErreurs(aDesErreursParChamp ? erreurCapturee.erreurs : { general: [erreurCapturee.message] });
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-10">
      <h1 className="text-4xl font-medium">Créer un compte</h1>

      <form onSubmit={soumettreFormulaire} className="bg-white p-8 border border-line">
        {erreurs.general && <p className="mb-4 font-bold">{erreurs.general[0]}</p>}

        <ChampFormulaire id="nom" libelle="Nom" valeur={nom} auChangement={setNom} erreurs={erreurs.name} />
        <ChampFormulaire id="email" libelle="Email" type="email"
          valeur={email} auChangement={setEmail} erreurs={erreurs.email} />
        <ChampFormulaire id="mot-de-passe" libelle="Mot de passe (8 caractères minimum)" type="password"
          valeur={motDePasse} auChangement={setMotDePasse} erreurs={erreurs.password} />

        <button
          type="submit"
          disabled={envoiEnCours}
          className="bouton mt-6 w-full text-center disabled:opacity-50"
        >
          {envoiEnCours ? "Création..." : "Créer mon compte"}
        </button>
      </form>

      <p className="mt-6">
        Déjà un compte ? <Link to="/connexion" className="font-bold text-brand underline">Se connecter</Link>
      </p>
    </div>
  );
}