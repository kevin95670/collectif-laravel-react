import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { recupererEvenements } from "../../api/evenements";
import { formaterDateCourte } from "../../utilitaires/dates";

// Section 04 : les quatre prochains événements, en lignes sur fond ciel
export default function SectionProchainsEvenements() {
  const [evenements, setEvenements] = useState([]);

  useEffect(() => {
    // Sans filtre : tous les événements à venir, du plus proche au plus lointain (le tri est fait par Laravel).
    // L'API est paginée : les événements sont dans "data" (la première page).
    // slice(0, 4) : on ne garde que les quatre premiers.
    recupererEvenements()
      .then((reponse) => setEvenements(reponse.data.slice(0, 4)))
      .catch(() => setEvenements([]));   // en cas d'erreur, la section affiche simplement le message vide
  }, []);

  // Le texte sous le titre : "sam. 21 nov. · 20:00 · Urban Soccer, Lyon · 8 sur 10 inscrits"
  function decrire(evenement) {
    const complet = evenement.participants_count >= evenement.nombre_places_max;
    const places = complet
      ? "Complet"
      : evenement.participants_count + " sur " + evenement.nombre_places_max + " inscrits";

    return [formaterDateCourte(evenement.date_debut), evenement.adresse + ", " + evenement.ville, places].join(" · ");
  }

  return (
    <section className="bg-ciel py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="text-center">
          <div className="numero">04</div>
          <h2 className="mt-5 text-5xl">Les prochains événements</h2>
          <div className="sous-titre mt-4">- près de chez toi -</div>
        </div>

        {evenements.length === 0 ? (
          <p className="mt-14 text-center text-sm text-gris">
            Aucun événement à venir pour le moment.{" "}
            <Link to="/evenements/creer" className="font-bold text-brand hover:underline">Crée le premier !</Link>
          </p>
        ) : (
          <ul className="mt-14 border-b border-marine/15">
            {evenements.map((evenement) => (
              // Au survol : fond blanc translucide et la ligne s'élargit un peu (hover:px-4)
              <li
                key={evenement.id}
                className="flex flex-wrap items-center gap-x-7 gap-y-4 border-t border-marine/15 py-7 transition-[padding,background-color] duration-300 hover:bg-white/40 hover:px-4 motion-reduce:transition-none"
              >
                {/* Le rond décoratif de la maquette */}
                <span className="h-[34px] w-[34px] shrink-0 rounded-full border-[1.5px] border-white bg-white/25" aria-hidden="true" />

                {/* basis-64 : cette zone prend la place disponible, et passe sous le bouton si l'écran est étroit */}
                <div className="min-w-0 flex-1 basis-64">
                  <Link to={"/evenements/" + evenement.id} className="font-titre text-3xl leading-tight text-marine md:text-[38px]">
                    {evenement.titre}
                  </Link>
                  <p className="mt-2 text-xs font-semibold tracking-[.06em] text-marine">{decrire(evenement)}</p>
                </div>

                <Link to={"/evenements/" + evenement.id} className="bouton bouton-petit">Voir l'événement</Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-11 text-center">
          <Link to="/evenements" className="bouton">Voir tous les événements</Link>
        </div>
      </div>
    </section>
  );
}