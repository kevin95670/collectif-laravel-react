import { Link } from "react-router-dom";

export default function PagePasTrouvee() {
  return (
    <div className="mx-auto max-w-xl px-10 py-24 text-center">
      <div className="sous-titre">- erreur 404 -</div>
      <h1 className="mt-4 text-5xl">Page introuvable</h1>
      <p className="mt-4 text-gris">Cette page n'existe pas ou a été déplacée.</p>
      <Link to="/" className="bouton mt-8 inline-block">Retour à l'accueil</Link>
    </div>
  );
}