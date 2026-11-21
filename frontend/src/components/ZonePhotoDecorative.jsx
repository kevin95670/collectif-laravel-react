// Photo décorative des pages. Sans "src" : aplat de couleur avec une étiquette.
// Pour mettre une vraie photo plus tard : la déposer dans frontend/public/images/
// puis passer src="/images/nom-du-fichier.jpg".
export default function ZonePhotoDecorative({ src, couleur = "#1F4F8F", legende = "", className = "" }) {
  if (src) {
    // alt="" : image purement décorative, ignorée par les lecteurs d'écran
    return <img src={src} alt="" className={"object-cover " + className} />;
  }

  return (
    <div
      className={"relative overflow-hidden " + className}
      style={{
        backgroundColor: couleur,
        // Fines rayures diagonales, comme dans la maquette
        backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,.07) 0 14px, transparent 14px 28px)",
      }}
    >
      {legende && (
        <span className="absolute left-3 top-3 border border-white/45 bg-white/20 px-2 py-1 text-xs font-semibold text-white">
          {legende}
        </span>
      )}
    </div>
  );
}