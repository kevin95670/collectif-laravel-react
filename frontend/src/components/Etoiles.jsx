// Affiche une note sur 5 en étoiles. Une moyenne comme 4,5 est arrondie à l'étoile la plus proche.
export default function Etoiles({ note, className = "" }) {
  const noteArrondie = Math.round(note);

  return (
    // role="img" + aria-label : les lecteurs d'écran lisent "4,5 sur 5" au lieu de cinq symboles
    <span className={className} role="img" aria-label={String(note).replace(".", ",") + " sur 5"}>
      {[1, 2, 3, 4, 5].map((valeur) => (
        <span key={valeur} className={valeur <= noteArrondie ? "text-brand" : "text-line"} aria-hidden="true">★</span>
      ))}
    </span>
  );
}