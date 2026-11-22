import ZonePhotoDecorative from "../ZonePhotoDecorative";

// Les trois photos de la section 05. "cadre" : la forme du cadre (la troisième a un coin bas droit arrondi).
const RENCONTRES = [
  { image: "foot", couleur: "#1F4F8F", legende: "Photo : match en salle", titre: "Foot du samedi, Lyon 7e", cadre: "" },
  { image: "running", couleur: "#C9B99A", legende: "Photo : groupe de coureurs", titre: "Sortie running du dimanche", cadre: "" },
  { image: "randonnee", couleur: "#7FA6D6", legende: "Photo : groupe en montagne", titre: "Randonnée des Monts d'Or", cadre: "rounded-br-[90px]" },
];

export default function SectionRencontres() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="text-center">
          <div className="numero">05</div>
          <h2 className="mt-5 text-5xl">Les dernières rencontres</h2>
          <div className="sous-titre mt-4">- en images -</div>
          <p className="texte-maj mx-auto mt-5 max-w-xl text-xs">
            Des matchs, des sorties et des randonnées organisés par la communauté.
          </p>
        </div>

        <div className="mt-14 grid gap-7 md:grid-cols-3">
          {RENCONTRES.map((rencontre) => (
            // "group" sur la figure : l'image s'agrandit quand on survole la figure entière
            <figure key={rencontre.image} className="group">
              <div className={"overflow-hidden " + rencontre.cadre}>
                <ZonePhotoDecorative
                  src={"/images/rencontre-" + rencontre.image + ".webp"}
                  couleur={rencontre.couleur}
                  legende={rencontre.legende}
                  className="h-[330px] transition duration-500 group-hover:scale-105 motion-reduce:transition-none"
                />
              </div>
              <figcaption className="mt-5 text-center font-titre text-[26px] leading-tight text-marine">
                {rencontre.titre}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}