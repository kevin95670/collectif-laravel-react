import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import GrilleEvenements from "../components/GrilleEvenements";
import ZonePhotoDecorative from "../components/ZonePhotoDecorative";
import PagePasTrouvee from "./PagePasTrouvee";
import { recupererEvenements, recupererSports } from "../api/evenements";
import { LISTE_DES_SPORTS } from "../constantes/sports";

export default function PageSport() {
  // Pour "/sports/football", sport vaut "football"
  const { sport } = useParams();
  // undefined si le code n'existe pas dans notre liste (ex : /sports/nimporte)
  const libelle = LISTE_DES_SPORTS.find((element) => element.valeur === sport)?.libelle;

  const [evenements, setEvenements] = useState([]);
  const [nombresParSport, setNombresParSport] = useState({});   // { football: 3, running: 1, ... }
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  // Les événements de ce sport. Relancé si on passe d'un sport à l'autre.
  useEffect(() => {
    if (!libelle) return;   // sport inconnu : rien à charger
    let ignorerCetteReponse = false;

    setChargement(true);
    setErreur("");

    recupererEvenements({ sport })
      .then((evenementsRecus) => {
        if (!ignorerCetteReponse) setEvenements(evenementsRecus);
      })
      .catch(() => {
        if (!ignorerCetteReponse) setErreur("Impossible de charger les événements.");
      })
      .finally(() => {
        if (!ignorerCetteReponse) setChargement(false);
      });

    return () => {
      ignorerCetteReponse = true;
    };
  }, [sport, libelle]);

  // Le nombre d'événements de chaque sport, pour les raccourcis. Une seule fois.
  useEffect(() => {
    recupererSports()
      .then((liste) => {
        const nombres = {};
        liste.forEach((element) => {
          nombres[element.sport] = element.nombre_evenements;
        });
        setNombresParSport(nombres);
      })
      .catch(() => {});   // sans les nombres, les raccourcis s'affichent quand même
  }, []);

  // Les hooks (useState, useEffect) sont tous appelés AVANT ce return : c'est une règle de React.
  if (!libelle) return <PagePasTrouvee />;

  return (
    <>
      {/* En-tête : photo du sport, assombrie, titre par-dessus */}
      <section className="relative flex min-h-[320px] items-center justify-center overflow-hidden text-center">
        <div className="absolute inset-0">
          <ZonePhotoDecorative
            src={"/images/sport-" + sport + ".webp"}
            couleur="#1F4F8F"
            legende={"Photo : " + libelle}
            className="h-full w-full"
          />
        </div>
        {/* Voile sombre : le texte blanc reste lisible quelle que soit la photo */}
        <div className="absolute inset-0 bg-marine/55" />

        <div className="relative px-6 py-16">
          <div className="sous-titre apparition text-white">- les sorties -</div>
          <h1 className="apparition mt-4 text-5xl text-white md:text-7xl" style={{ animationDelay: "0.15s" }}>{libelle}</h1>
          {!chargement && !erreur && (
            <p className="texte-maj apparition mt-4 text-xs text-white" style={{ animationDelay: "0.3s" }}>
              {evenements.length} {evenements.length > 1 ? "événements à venir" : "événement à venir"}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-14 md:px-10">
        {/* Les autres sports : le sport actuel est plein, les autres en contour */}
        <nav aria-label="Autres sports" className="flex flex-wrap justify-center gap-3">
          {LISTE_DES_SPORTS.map((element) => {
            const estActuel = element.valeur === sport;
            return (
              <Link
                key={element.valeur}
                to={"/sports/" + element.valeur}
                aria-current={estActuel ? "page" : undefined}
                className={
                  "border border-marine px-4 py-2 text-[11px] font-bold uppercase tracking-[.09em] transition-colors " +
                  (estActuel ? "bg-marine text-white" : "text-marine hover:bg-ciel")
                }
              >
                {element.libelle} ({nombresParSport[element.valeur] ?? 0})
              </Link>
            );
          })}
        </nav>

        <div className="mt-12">
          {erreur && <p className="text-center font-bold">{erreur}</p>}
          {chargement && <p className="text-center text-gris">Chargement...</p>}

          {!chargement && !erreur && evenements.length === 0 && (
            <div className="border border-line bg-white px-6 py-14 text-center">
              <p className="font-titre text-3xl text-marine">Aucun événement de {libelle.toLowerCase()} à venir</p>
              <p className="mt-3 text-sm text-gris">Sois le premier à en proposer un.</p>
              <Link to="/evenements/creer" className="bouton mt-6">Créer un événement</Link>
            </div>
          )}

          {!chargement && !erreur && evenements.length > 0 && (
            <>
              <GrilleEvenements evenements={evenements} />
              <p className="mt-8 text-center text-sm text-gris">
                Une ville ou une date en tête ?{" "}
                <Link to={"/evenements?sport=" + sport} className="font-bold text-brand hover:underline">Affiner la recherche</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}