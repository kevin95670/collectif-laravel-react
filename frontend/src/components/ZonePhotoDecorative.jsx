import { useState } from "react";

// Image décorative de mise en page. Sans "src", ou si le fichier est introuvable :
// aplat de couleur rayé avec une étiquette. Avec "src" : la vraie photo.
// Photos déposées dans frontend/public/images/, utilisées avec src="/images/nom-du-fichier.webp".
export default function ZonePhotoDecorative({ src, couleur = "#1F4F8F", legende = "", className = "" }) {
  // onError se déclenche si le navigateur n'arrive pas à charger l'image (fichier absent, mauvais nom)
  const [imageEnEchec, setImageEnEchec] = useState(false);
  const afficherImage = src && !imageEnEchec;

  return (
    // Le cadre garde la taille donnée par className ; l'image est posée dedans (absolute + inset-0)
    // et recadrée pour le remplir (object-cover).
    <div
      className={"relative overflow-hidden " + className}
      style={{
        backgroundColor: couleur,
        // Fines rayures diagonales, comme dans la maquette
        backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,.07) 0 14px, transparent 14px 28px)",
      }}
    >
      {afficherImage ? (
        // alt="" : image purement décorative, ignorée par les lecteurs d'écran
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setImageEnEchec(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        legende && (
          <span className="absolute left-3 top-3 border border-white/45 bg-white/20 px-2 py-1 text-xs font-semibold text-white">
            {legende}
          </span>
        )
      )}
    </div>
  );
}