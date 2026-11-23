import { useState } from "react";
import ChampFormulaire from "./ChampFormulaire";
import { donnerAvis } from "../api/avis";

// auSucces(avis) : appelée avec l'avis enregistré, pour que la page remplace le formulaire par l'avis
export default function FormulaireAvis({ evenementId, auSucces }) {
  const [note, setNote] = useState(0);              // 0 = pas encore choisie
  const [noteSurvolee, setNoteSurvolee] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function envoyer(evenementFormulaire) {
    evenementFormulaire.preventDefault();
    setErreur("");
    setEnvoiEnCours(true);

    try {
      const avis = await donnerAvis(evenementId, { note: note, commentaire: commentaire });
      auSucces(avis);
    } catch (erreurCapturee) {
      setErreur(erreurCapturee.erreurs?.note?.[0] ?? erreurCapturee.erreurs?.commentaire?.[0] ?? erreurCapturee.message);
    } finally {
      setEnvoiEnCours(false);
    }
  }

  // Les étoiles s'allument jusqu'à celle qu'on survole, ou jusqu'à la note choisie
  const noteAffichee = noteSurvolee || note;

  return (
    <form onSubmit={envoyer} className="mt-6">
      <p className="text-xs font-bold uppercase tracking-[.09em] text-marine">Ta note</p>

      <div role="radiogroup" aria-label="Note sur 5" className="mt-1 flex gap-1">
        {[1, 2, 3, 4, 5].map((valeur) => (
          <button
            key={valeur}
            type="button"
            role="radio"
            aria-checked={note === valeur}
            aria-label={valeur + " sur 5"}
            onClick={() => setNote(valeur)}
            onMouseEnter={() => setNoteSurvolee(valeur)}
            onMouseLeave={() => setNoteSurvolee(0)}
            className={"text-4xl leading-none transition " + (valeur <= noteAffichee ? "text-brand" : "text-line")}
          >
            ★
          </button>
        ))}
      </div>

      <div className="mt-5">
        <ChampFormulaire id="avis-commentaire" libelle="Commentaire (facultatif)" multiligne
          valeur={commentaire} auChangement={setCommentaire} />
      </div>

      {erreur && <p className="mt-3 text-sm font-bold text-brand">{erreur}</p>}

      <button type="submit" disabled={note === 0 || envoiEnCours} className="bouton mt-6 disabled:opacity-50">
        {envoiEnCours ? "Envoi..." : "Publier mon avis"}
      </button>
    </form>
  );
}