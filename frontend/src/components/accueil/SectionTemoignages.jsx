import { useState } from "react";

// Textes d'exemple, à remplacer par de vrais retours le jour où il y en aura
const TEMOIGNAGES = [
  {
    titre: "« Complet en une soirée ! »",
    texte: "Créer mon match a pris deux minutes, et les places étaient toutes prises le soir même. Le chat a évité plusieurs retards.",
    auteur: "Prénom N., organisateur",
  },
  {
    titre: "« Plus besoin de relancer tout le monde »",
    texte: "Les places sont comptées toutes seules et chacun sait où et quand. Je n'ai plus qu'à apporter le ballon.",
    auteur: "Prénom N., organisateur",
  },
  {
    titre: "« J'ai trouvé un groupe près de chez moi »",
    texte: "Je cherchais des gens pour courir le dimanche matin. Un clic pour rejoindre, et je n'étais plus seul sur la ligne de départ.",
    auteur: "Prénom N., participant",
  },
];

export default function SectionTemoignages() {
  // Indice du témoignage affiché (0, 1 ou 2)
  const [indice, setIndice] = useState(0);
  const temoignage = TEMOIGNAGES[indice];

  // Le modulo (%) fait boucler : après le dernier on revient au premier.
  // Pour reculer, on ajoute la longueur avant le modulo, car (-1) % 3 donnerait -1 en JavaScript.
  function suivant() {
    setIndice((indiceActuel) => (indiceActuel + 1) % TEMOIGNAGES.length);
  }
  function precedent() {
    setIndice((indiceActuel) => (indiceActuel - 1 + TEMOIGNAGES.length) % TEMOIGNAGES.length);
  }

  const classesFleche = "h-10 w-10 shrink-0 text-3xl leading-none text-gris hover:text-marine";

  return (
    <section className="bg-white pb-24">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="grid items-center gap-12 border-t border-line pt-5 lg:grid-cols-[1fr_1.6fr]">
          <div className="pt-10 lg:pt-[60px]">
            <div className="numero">06</div>
            <h2 className="mt-6 text-4xl">Ce qu'en disent les joueurs</h2>
            <div className="sous-titre mt-4">- témoignages -</div>
          </div>

          <div className="flex items-center gap-2 pt-4 md:gap-7 lg:pt-[60px]">
            <button type="button" onClick={precedent} aria-label="Témoignage précédent" className={classesFleche}>‹</button>

            {/* key={indice} : quand l'indice change, React remplace le bloc par un nouveau,
                et l'animation d'apparition se rejoue. aria-live : les lecteurs d'écran annoncent le changement. */}
            <div key={indice} aria-live="polite" className="apparition flex flex-1 flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
              <div className="flex h-[110px] w-[110px] shrink-0 items-center justify-center rounded-full bg-marine font-titre text-6xl text-white" aria-hidden="true">
                «
              </div>
              <div>
                <div className="font-titre text-[26px] leading-tight text-marine">{temoignage.titre}</div>
                <p className="mt-3 text-sm leading-7 text-gris">{temoignage.texte}</p>
                <div className="mt-3 text-xs font-bold italic text-marine">- {temoignage.auteur} -</div>
                <div className="mt-1.5 text-[11px] text-gris">Témoignage d'exemple, à remplacer par un vrai retour.</div>
              </div>
            </div>

            <button type="button" onClick={suivant} aria-label="Témoignage suivant" className={classesFleche}>›</button>
          </div>
        </div>
      </div>
    </section>
  );
}