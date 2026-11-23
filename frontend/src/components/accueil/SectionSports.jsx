import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ZonePhotoDecorative from "../ZonePhotoDecorative";
import { recupererSports } from "../../api/evenements";
import { libelleDuSport } from "../../constantes/sports";

// Couleur de l'aplat de chaque sport, en attendant de vraies photos
const COULEURS_DES_SPORTS = {
  football: "#1F4F8F",
  running: "#C9B99A",
  basket: "#0B2A5B",
  randonnee: "#7FA6D6",
  padel: "#5E8BC4",
  tennis: "#A9C4E6",
  natation: "#1F4F8F",
  velo: "#C9B99A",
  autre: "#7FA6D6",
};

export default function SectionSports() {
  const [sports, setSports] = useState([]);

  useEffect(() => {
    recupererSports()
      .then(setSports)
      .catch(() => setSports([]));   // en cas d'erreur, la section reste simplement vide
  }, []);

  // sort() modifie le tableau d'origine : on en fait d'abord une copie avec [...sports].
  // Tri décroissant par nombre d'événements ; slice(0, 4) garde les quatre premiers.
  const sportsPopulaires = [...sports]
    .sort((sportA, sportB) => sportB.nombre_evenements - sportA.nombre_evenements)
    .slice(0, 4);

  return (
    <section className="bg-creme pt-24">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="text-center">
          <div className="numero">02</div>
          <h2 className="mt-5 text-5xl">Choisis ton sport</h2>
          <div className="sous-titre mt-4">- activités -</div>
          <p className="texte-maj mx-auto mt-5 max-w-xl text-xs">
            Football, running, basket, randonnée : un événement pour chaque envie et chaque niveau.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sportsPopulaires.map((sport) => (
            // Le lien ouvre la recherche déjà filtrée sur ce sport : /evenements?sport=football
            <Link key={sport.sport} to={"/sports/" + sport.sport} className="group block text-center">
              <div className="overflow-hidden">
                {/* group-hover : l'image s'agrandit quand on survole la carte entière */}
                <ZonePhotoDecorative
                  src={"/images/sport-" + sport.sport + ".webp"}
                  couleur={COULEURS_DES_SPORTS[sport.sport]}
                  legende={"Photo : " + libelleDuSport(sport.sport)}
                  className="h-[360px] transition duration-500 group-hover:scale-105 motion-reduce:transition-none"
                />
              </div>
              <div className="texte-maj mt-5 text-xs text-brand">
                {sport.nombre_evenements} {sport.nombre_evenements > 1 ? "événements" : "événement"}
              </div>
              <div className="mt-2 font-titre text-3xl text-marine">{libelleDuSport(sport.sport)}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}