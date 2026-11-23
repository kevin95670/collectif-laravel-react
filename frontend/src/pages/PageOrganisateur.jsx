import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import GrilleEvenements from "../components/GrilleEvenements";
import PagePasTrouvee from "./PagePasTrouvee";
import { recupererOrganisateur } from "../api/organisateurs";
import SectionAvisOrganisateur from "../components/SectionAvisOrganisateur";

export default function PageOrganisateur() {
  const { id } = useParams();

  const [organisateur, setOrganisateur] = useState(null);   // null = pas encore reçu
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [introuvable, setIntrouvable] = useState(false);

  useEffect(() => {
    setChargement(true);
    setErreur("");
    setIntrouvable(false);

    recupererOrganisateur(id)
      .then(setOrganisateur)
      .catch((erreurCapturee) => {
        if (erreurCapturee.statut === 404) setIntrouvable(true);
        else setErreur("Impossible de charger cette page.");
      })
      .finally(() => setChargement(false));
  }, [id]);

  if (chargement) return <p className="p-16 text-center text-gris">Chargement...</p>;
  if (introuvable) return <PagePasTrouvee />;
  if (erreur) return <p className="p-16 text-center font-bold">{erreur}</p>;

  // "novembre 2026"
  const membreDepuis = new Date(organisateur.membre_depuis).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  const nombreAVenir = organisateur.evenements_a_venir.length;

  return (
    <>
      <section className="border-b border-line bg-white px-6 py-16 text-center md:px-10">
        {/* Un rond avec l'initiale : on n'a pas de photo de profil */}
        <div className="apparition mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-marine pt-2 font-titre text-5xl text-white" aria-hidden="true">
          {organisateur.name.charAt(0).toUpperCase()}
        </div>
        <div className="sous-titre apparition mt-6" style={{ animationDelay: "0.1s" }}>- organisateur -</div>
        <h1 className="apparition mt-3 text-5xl leading-[1.05] md:text-6xl" style={{ animationDelay: "0.2s" }}>{organisateur.name}</h1>
        <p className="texte-maj apparition mt-5 text-xs" style={{ animationDelay: "0.3s" }}>
          Membre depuis {membreDepuis} · {organisateur.nombre_evenements_passes} {organisateur.nombre_evenements_passes > 1 ? "événements organisés" : "événement organisé"}
        </p>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-14 md:px-10">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line pb-3">
          <h2 className="text-4xl">Prochains événements</h2>
          <span className="ml-auto text-xs font-bold uppercase tracking-[.09em] text-brand">
            {nombreAVenir} {nombreAVenir > 1 ? "événements" : "événement"}
          </span>
        </div>

        {nombreAVenir === 0 ? (
          <div className="mt-6 border border-line bg-white px-6 py-10 text-center">
            <p className="text-sm text-gris">Aucun événement à venir pour le moment.</p>
            <Link to="/evenements" className="bouton-contour mt-5">Voir tous les événements</Link>
          </div>
        ) : (
          <div className="mt-6">
            <GrilleEvenements evenements={organisateur.evenements_a_venir} />
          </div>
        )}

        {/* La note moyenne et les avis : la section se charge toute seule à partir de l'identifiant */}
        <SectionAvisOrganisateur organisateurId={id} />
      </div>
    </>
  );
}