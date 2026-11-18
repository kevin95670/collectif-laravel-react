import { Link } from "react-router-dom";

export default function PiedDePage() {
  return (
    <footer className="bg-marine px-10 py-14 text-center text-white">
      <div className="font-titre text-4xl text-white">collectif</div>
      <p className="texte-maj mt-4 text-[11px]">Trouve du monde pour jouer, courir ou marcher.</p>

      <nav aria-label="Pied de page" className="mt-8 flex justify-center gap-6 text-sm">
        <Link to="/" className="underline underline-offset-4">Événements</Link>
        <Link to="/connexion" className="underline underline-offset-4">Se connecter</Link>
        <Link to="/inscription" className="underline underline-offset-4">S'inscrire</Link>
      </nav>

      <p className="mt-10 text-xs font-semibold">© 2026 Collectif · Tous droits réservés</p>
    </footer>
  );
}