import { Link } from "react-router-dom";
import { useUtilisateur } from "../contexts/ContexteUtilisateur";
import MenuUtilisateur from "./MenuUtilisateur";
import BoutonNotifications from "./BoutonNotifications";

export default function EnTete() {
  const { utilisateur, chargementUtilisateur } = useUtilisateur();

  const classesNavigation = "texte-maj text-marine hover:text-brand";

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5 md:px-10">
        <Link to="/" className="font-titre text-3xl text-marine">Collectif</Link>

        <nav className="flex flex-wrap items-center gap-5 md:gap-8">
          <Link to="/" className={classesNavigation}>Accueil</Link>
          <Link to="/evenements" className={classesNavigation}>Trouver un événement</Link>
          {/* Visible pour tout le monde : si on n'est pas connecté, RouteProtegee redirige vers /connexion */}
          <Link to="/evenements/creer" className={classesNavigation}>Créer un événement</Link>

          {/* Pendant le chargement on n'affiche rien à droite, pour éviter un clignotement */}
          {!chargementUtilisateur && (
            utilisateur ? (
              // Connecté : la cloche et le petit bonhomme, côte à côte
              <div className="flex items-center gap-3">
                <BoutonNotifications />
                <MenuUtilisateur />
              </div>
            ) : (
              <Link to="/connexion" className="bouton">Se connecter</Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}