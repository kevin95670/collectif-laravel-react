// Affiche la photo d'un événement, ou un placeholder si elle n'existe pas.
// "className" fixe la taille depuis l'extérieur : photo et placeholder ont ainsi toujours la même forme.
export default function PhotoEvenement({ url, alt = "", className = "" }) {
  if (url) {
    // object-cover : l'image remplit le cadre en étant recadrée, sans déformation
    return <img src={url} alt={alt} className={"object-cover " + className} />;
  }

  return (
    <div role="img" aria-label="Pas de photo" className={"flex items-center justify-center bg-ciel text-marine " + className}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.5">
        <rect x="3" y="4" width="18" height="16" />
        <circle cx="9" cy="9.5" r="1.8" />
        <path d="M3 17l5-5 4 4 3-3 6 6" />
      </svg>
    </div>
  );
}