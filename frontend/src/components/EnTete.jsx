import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useUtilisateur } from "../contexts/ContexteUtilisateur";
import MenuUtilisateur from "./MenuUtilisateur";
import BoutonNotifications from "./BoutonNotifications";

export default function EnTete() {
  const { utilisateur, chargementUtilisateur, seDeconnecter } = useUtilisateur();
  const naviguer = useNavigate();
  const emplacement = useLocation();

  // true = le panneau du menu mobile est ouvert
  const [menuMobileOuvert, setMenuMobileOuvert] = useState(false);

  // À chaque changement de page, on referme le panneau
  useEffect(() => {
    setMenuMobileOuvert(false);
  }, [emplacement.pathname]);

  async function deconnecter() {
    await seDeconnecter();
    naviguer("/");
  }

  // Style commun des lignes du panneau mobile
  const classesLigneMobile = "block w-full border-b border-line py-3 text-left text-sm font-semibold text-marine";

  return (
    <header className="relative border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-5 py-3.5 md:px-10 md:py-4">
        <Link to="/" className="font-titre text-[28px] leading-none tracking-[.02em] text-marine md:text-[34px]">
          collectif
        </Link>

        {/* "hidden md:flex" : cachée sur mobile (remplacée par le panneau), visible à partir de md */}
        <nav aria-label="Navigation principale" className="hidden items-center gap-[34px] md:flex">
          <NavLink to="/" end className="lien-nav">Accueil</NavLink>
          <NavLink to="/evenements" end className="lien-nav">Trouver un événement</NavLink>
        </nav>

        <div className="flex items-center gap-3 md:gap-5">
          {/* La cloche reste visible partout quand on est connecté */}
          {!chargementUtilisateur && utilisateur && <BoutonNotifications />}

          {/* Le bonhomme et "Se connecter" : sur ordinateur seulement (sur mobile, ils sont dans le panneau) */}
          {!chargementUtilisateur && (
            utilisateur ? (
              <div className="hidden md:block"><MenuUtilisateur /></div>
            ) : (
              <Link to="/connexion" className="lien-nav hidden md:inline">Se connecter</Link>
            )
          )}

          {/* Sur mobile : "Créer" tout court et plus petit. "md:inline" : le reste du texte n'apparaît qu'à partir de md. */}
          <Link to="/evenements/creer" className="bouton bouton-petit px-4 py-3 md:px-6 md:py-3.5">
            Créer<span className="hidden md:inline"> un événement</span>
          </Link>

          {/* Le bouton menu : seulement sur mobile (md:hidden) */}
          <button
            type="button"
            onClick={() => setMenuMobileOuvert(!menuMobileOuvert)}
            aria-label="Menu"
            aria-expanded={menuMobileOuvert}
            aria-controls="menu-mobile"
            className="flex h-10 w-10 items-center justify-center border border-line text-marine md:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {menuMobileOuvert ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Le panneau mobile : sous l'en-tête, pleine largeur */}
      {menuMobileOuvert && (
        <nav id="menu-mobile" aria-label="Menu mobile" className="border-t border-line bg-white px-5 py-2 md:hidden">
          <NavLink to="/" end className={classesLigneMobile}>Accueil</NavLink>
          <NavLink to="/evenements" end className={classesLigneMobile}>Trouver un événement</NavLink>

          {!chargementUtilisateur && (
            utilisateur ? (
              <>
                <NavLink to="/mes-evenements" className={classesLigneMobile}>Mes événements</NavLink>
                <NavLink to="/profil" className={classesLigneMobile}>Mon profil</NavLink>
                <button type="button" onClick={deconnecter} className={classesLigneMobile + " border-b-0"}>Se déconnecter</button>
              </>
            ) : (
              <>
                <NavLink to="/connexion" className={classesLigneMobile}>Se connecter</NavLink>
                <NavLink to="/inscription" className={classesLigneMobile + " border-b-0"}>Créer un compte</NavLink>
              </>
            )
          )}
        </nav>
      )}
    </header>
  );
}