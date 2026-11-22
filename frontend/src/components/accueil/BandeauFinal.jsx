import { Link } from "react-router-dom";
import ZonePhotoDecorative from "../ZonePhotoDecorative";

export default function BandeauFinal() {
  return (
    <section className="bg-marine px-6 pt-20 md:px-10">
      {/* relative : sert de repère aux éléments "absolute" posés dedans */}
      <div className="relative mx-auto flex h-[260px] max-w-6xl items-center justify-center overflow-hidden text-center">
        {/* La photo remplit tout le bandeau. Le <div> absolute évite que la photo ne bouscule le texte. */}
        <div className="absolute inset-0">
          <ZonePhotoDecorative
            src="/images/accueil-bandeau.webp"
            couleur="#06193B"
            legende="Photo : terrain au coucher du soleil"
            className="h-full w-full"
          />
        </div>

        {/* Voile sombre par-dessus la photo : "marine/60" = marine à 60 % d'opacité, pour que le texte reste lisible */}
        <div className="absolute inset-0 bg-marine/60" />

        {/* relative : place le texte au-dessus du voile */}
        <div className="relative px-6">
          <h2 className="text-4xl text-white md:text-[44px]">Prépare ton prochain match</h2>
          <p className="texte-maj mt-3 text-[11px] text-white">Crée un événement ou rejoins-en un dès aujourd'hui.</p>
          <Link to="/evenements/creer" className="bouton bouton-creme mt-6">Créer un événement</Link>
        </div>
      </div>
    </section>
  );
}