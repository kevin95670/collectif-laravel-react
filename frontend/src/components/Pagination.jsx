// Boutons "Précédent / Suivant" et numéro de la page. Rien ne s'affiche s'il n'y a qu'une page.
export default function Pagination({ page, dernierePage, auChangement }) {
  if (dernierePage <= 1) return null;

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-6">
      <button
        type="button"
        onClick={() => auChangement(page - 1)}
        disabled={page <= 1}
        className="bouton-contour disabled:cursor-not-allowed disabled:opacity-40"
      >
        Précédent
      </button>

      <span className="text-xs font-bold uppercase tracking-[.09em] text-marine">
        Page {page} sur {dernierePage}
      </span>

      <button
        type="button"
        onClick={() => auChangement(page + 1)}
        disabled={page >= dernierePage}
        className="bouton-contour disabled:cursor-not-allowed disabled:opacity-40"
      >
        Suivant
      </button>
    </nav>
  );
}