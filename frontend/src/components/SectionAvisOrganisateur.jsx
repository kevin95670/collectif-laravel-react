import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Etoiles from "./Etoiles";
import { recupererAvisOrganisateur } from "../api/avis";
import { formaterDate } from "../utilitaires/dates";

// Se charge toute seule : il suffit de lui donner l'identifiant de l'organisateur
export default function SectionAvisOrganisateur({ organisateurId }) {
  const [donnees, setDonnees] = useState(null);   // null = pas encore reçu
  const [erreur, setErreur] = useState(false);

  useEffect(() => {
    setDonnees(null);
    setErreur(false);
    recupererAvisOrganisateur(organisateurId)
      .then(setDonnees)
      .catch(() => setErreur(true));
  }, [organisateurId]);

  if (erreur) return <p className="mt-14 text-center text-sm text-gris">Impossible de charger les avis.</p>;
  if (donnees === null) return null;

  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line pb-3">
        <h2 className="text-4xl">Avis</h2>
        {donnees.nombre > 0 && (
          <span className="ml-auto flex items-center gap-2 text-xs font-bold uppercase tracking-[.09em] text-brand">
            <Etoiles note={donnees.moyenne} className="text-lg" />
            {String(donnees.moyenne).replace(".", ",")} / 5 · {donnees.nombre} {donnees.nombre > 1 ? "avis" : "avis"}
          </span>
        )}
      </div>

      {donnees.nombre === 0 ? (
        <p className="mt-6 text-sm text-gris">Aucun avis pour l'instant.</p>
      ) : (
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {donnees.avis.map((avis) => (
            <li key={avis.id} className="bg-ciel p-2.5 shadow-carte">
              <div className="h-full bg-white p-6">
                <Etoiles note={avis.note} className="text-xl" />
                {avis.commentaire && <p className="mt-3 text-sm leading-7 text-gris">{avis.commentaire}</p>}
                <p className="mt-4 text-xs text-gris">
                  <span className="font-bold text-marine">{avis.auteur}</span>, à propos de{" "}
                  <Link to={"/evenements/" + avis.evenement_id} className="font-bold text-brand hover:underline">
                    {avis.evenement_titre}
                  </Link>
                  {" "}· {formaterDate(avis.created_at)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}