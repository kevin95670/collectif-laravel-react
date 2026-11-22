import { Link } from "react-router-dom";
import ZonePhotoDecorative from "../ZonePhotoDecorative";

// Le grand bandeau du haut : photo à gauche, texte à droite (empilés sur mobile)
export default function SectionPresentation() {
  return (
    <section className="grid bg-creme md:min-h-[680px] md:grid-cols-2">
      <ZonePhotoDecorative
        src="/images/accueil-presentation.webp"
        couleur="#1F4F8F"
        legende="Photo : équipe qui se félicite après un match"
        className="min-h-[320px] md:min-h-[680px]"
      />

      <div className="flex flex-col items-center justify-center px-8 py-16 text-center md:px-16">
        {/* style={{ animationDelay }} : chaque élément apparaît un peu après le précédent */}
        <span className="sous-titre apparition" style={{ animationDelay: "0.05s" }}>- événements sportifs -</span>
        <h1 className="apparition mt-5 text-5xl leading-[1.02] md:text-7xl" style={{ animationDelay: "0.2s" }}>
          Bouger ensemble, près de chez toi
        </h1>

        {/* Le petit trait vertical décoratif */}
        <div className="apparition my-7 h-14 w-px bg-brand" style={{ animationDelay: "0.35s" }} />

        <p className="texte-maj apparition max-w-md" style={{ animationDelay: "0.35s" }}>
          Réunis des joueurs, choisis un lieu, fixe le nombre de places.
        </p>
        <p className="apparition mt-5 max-w-md text-sm leading-7 text-gris" style={{ animationDelay: "0.5s" }}>
          Crée un événement sport ou rejoins ceux qui ont lieu près de chez toi : une adresse, un horaire,
          des places limitées, et un chat pour s'organiser avant le coup d'envoi.
        </p>
        <div className="apparition mt-8" style={{ animationDelay: "0.65s" }}>
          <Link to="/evenements" className="bouton">Voir les événements</Link>
        </div>
      </div>
    </section>
  );
}