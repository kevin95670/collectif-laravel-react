import { Link, useNavigate } from "react-router-dom";
import { useUtilisateur } from "../contexts/ContexteUtilisateur";

// Le style commun de tous les liens du pied de page : soulignés, un peu pâles au survol
const CLASSES_LIEN = "font-semibold underline underline-offset-4 transition-opacity hover:opacity-70";

export default function PiedDePage() {
  const { utilisateur, chargementUtilisateur, seDeconnecter } = useUtilisateur();
  const naviguer = useNavigate();
  const annee = new Date().getFullYear();

  async function deconnecter() {
    await seDeconnecter();
    naviguer("/");
  }

  return (
    <footer className="bg-marine px-6 text-white md:px-10">
      <div className="mx-auto max-w-6xl py-14 text-center">
        {/* Trois colonnes de largeur égale (grid-cols-3) : celle du milieu est donc exactement au centre.
            Sur mobile, tout est empilé et centré. */}
        <div className="grid items-center gap-4 text-xs md:grid-cols-3">
          <a href="tel:+33400000000" className={CLASSES_LIEN + " md:justify-self-start"}>+33 4 00 00 00 00</a>
          <span className="font-titre text-4xl leading-none md:justify-self-center">collectif</span>
          <a href="mailto:contact@collectif.test" className={CLASSES_LIEN + " md:justify-self-end"}>contact@collectif.test</a>
        </div>

        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[.09em]">
          Trouve du monde pour jouer, courir ou marcher.
        </p>

        <nav aria-label="Pied de page" className="mt-7 flex flex-wrap justify-center gap-x-7 gap-y-2 text-xs">
          <Link to="/" className={CLASSES_LIEN}>Accueil</Link>
          <Link to="/evenements" className={CLASSES_LIEN}>Événements</Link>
          <Link to="/evenements/creer" className={CLASSES_LIEN}>Créer un événement</Link>

          {/* Pendant le chargement on n'affiche rien, pour éviter un clignotement */}
          {!chargementUtilisateur && (
            utilisateur ? (
              <>
                <Link to="/mes-evenements" className={CLASSES_LIEN}>Mes événements</Link>
                <Link to="/profil" className={CLASSES_LIEN}>Mon profil</Link>
                {/* Un <button> (et non un lien) : c'est une action, pas une page */}
                <button type="button" onClick={deconnecter} className={CLASSES_LIEN}>Se déconnecter</button>
              </>
            ) : (
              <>
                <Link to="/connexion" className={CLASSES_LIEN}>Se connecter</Link>
                <Link to="/inscription" className={CLASSES_LIEN}>Créer un compte</Link>
              </>
            )
          )}
        </nav>

        {/* Un filet fin sépare les mentions légales du reste */}
        <div className="mt-10 flex flex-col items-center gap-1 border-t border-white/20 pt-6 text-xs font-semibold md:flex-row md:justify-between">
          <span>© {annee} Collectif</span>
          <span>Tous droits réservés</span>
        </div>
      </div>
    </footer>
  );
}