import { Link } from "react-router-dom";

export default function PagePasTrouvee() {
  return (
    <div className="px-6 py-24 text-center md:py-32">
      <div className="font-titre text-8xl leading-none text-brand md:text-9xl">404</div>
      <div className="sous-titre mt-6">- page introuvable -</div>
      <h1 className="mx-auto mt-4 max-w-2xl text-4xl md:text-5xl">Hors-jeu</h1>
      <p className="texte-maj mx-auto mt-5 max-w-md text-xs">Cette page n'existe pas ou a été déplacée.</p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link to="/" className="bouton">Retour à l'accueil</Link>
        <Link to="/evenements" className="bouton-contour">Voir les événements</Link>
      </div>
    </div>
  );
}