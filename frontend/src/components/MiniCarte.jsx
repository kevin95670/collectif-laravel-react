import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";   // le style de Leaflet (boutons zoom, tuiles, etc.)

export default function MiniCarte({ latitude, longitude }) {
  // Poignée vers le <div> réel dans lequel Leaflet va dessiner la carte
  const conteneurRef = useRef(null);

  useEffect(() => {
    // 1. On crée la carte dans le <div>, centrée sur l'événement (zoom 15 = niveau d'un quartier).
    // scrollWheelZoom: false : la molette fait défiler la PAGE, elle ne zoome pas la carte par accident.
    const carte = L.map(conteneurRef.current, { scrollWheelZoom: false })
      .setView([latitude, longitude], 15);

    // 2. Le fond de carte : les images (tuiles) libres d'OpenStreetMap
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      // La mention est obligatoire avec OpenStreetMap
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
    }).addTo(carte);

    // 3. Le repère : un rond aux couleurs du site (marine = #0B2A5B, brand = #0B57A8).
    // On n'utilise pas l'épingle par défaut de Leaflet : son image est mal retrouvée par Vite.
    L.circleMarker([latitude, longitude], {
      radius: 11,
      color: "#0B2A5B",
      weight: 3,
      fillColor: "#0B57A8",
      fillOpacity: 1,
    }).addTo(carte);

    // Nettoyage : quand le composant disparaît (ou que les coordonnées changent),
    // on détruit la carte. Sans cela, Leaflet refuse de recréer une carte dans le même <div>.
    return () => carte.remove();
  }, [latitude, longitude]);

  return (
    <div>
      {/* "isolate" : Leaflet utilise de gros z-index en interne. Cette classe enferme la carte
          pour qu'elle ne passe jamais par-dessus le menu et la liste des notifications. */}
      <div
        ref={conteneurRef}
        className="isolate h-64 w-full border border-line"
        aria-label="Carte du lieu de l'événement"
      />
      <a
        href={"https://www.openstreetmap.org/?mlat=" + latitude + "&mlon=" + longitude + "#map=17/" + latitude + "/" + longitude}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-block text-sm font-semibold text-brand hover:underline"
      >
        Ouvrir dans une carte plus grande
      </a>
    </div>
  );
}