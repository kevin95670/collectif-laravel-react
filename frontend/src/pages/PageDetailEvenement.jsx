import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useUtilisateur } from "../contexts/ContexteUtilisateur";
import { recupererEvenement, rejoindreEvenement, quitterEvenement, annulerEvenement } from "../api/evenements";
import { LISTE_DES_SPORTS } from "../constantes/sports";
import { formaterDate } from "../utilitaires/dates";
import ChatEvenement from "../components/ChatEvenement";
import PhotoEvenement from "../components/PhotoEvenement";
import MiniCarte from "../components/MiniCarte";
import BoutonFavori from "../components/BoutonFavori";
import Etoiles from "../components/Etoiles";
import FormulaireAvis from "../components/FormulaireAvis";

export default function PageDetailEvenement() {
  // useParams lit les parties variables de l'URL : pour "/evenements/3", id vaut "3"
  const { id } = useParams();
  const { utilisateur } = useUtilisateur();

  const [evenement, setEvenement] = useState(null);   // null = pas encore reçu
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  const [actionEnCours, setActionEnCours] = useState(false);
  const [messageAction, setMessageAction] = useState("");   // erreur du bouton (ex : "complet")

  // Dépendance [id] : si on passe d'un événement à un autre, on recharge.
  useEffect(() => {
    setChargement(true);
    setErreur("");

    recupererEvenement(id)
      .then(setEvenement)
      .catch((erreurCapturee) => {
        setErreur(erreurCapturee.statut === 404 ? "Cet événement n'existe pas." : "Impossible de charger l'événement.");
      })
      .finally(() => setChargement(false));
  }, [id]);

  // Un seul bouton : il rejoint si on n'est pas inscrit, il quitte sinon.
  async function changerInscription() {
    setActionEnCours(true);
    setMessageAction("");

    try {
      // Laravel renvoie l'événement à jour (places restantes, participants) : on le range tel quel
      const evenementMisAJour = evenement.utilisateur_est_inscrit
        ? await quitterEvenement(id)
        : await rejoindreEvenement(id);
      setEvenement(evenementMisAJour);
    } catch (erreurCapturee) {
      setMessageAction(erreurCapturee.message);   // ex : "Cet événement est complet."
    } finally {
      setActionEnCours(false);
    }
  }

  // L'organisateur annule l'événement : on demande confirmation, puis on range la réponse à jour
  async function annulerCetEvenement() {
    if (!window.confirm("Annuler cet événement ? Cette action est définitive.")) return;

    setActionEnCours(true);
    setMessageAction("");
    try {
      setEvenement(await annulerEvenement(id));
    } catch (erreurCapturee) {
      setMessageAction(erreurCapturee.message);
    } finally {
      setActionEnCours(false);
    }
  }

  if (chargement) return <p className="p-16 text-center text-gris">Chargement...</p>;
  if (erreur) {
    return (
      <div className="px-6 py-20 text-center">
        <p className="font-titre text-4xl text-marine">{erreur}</p>
        <Link to="/evenements" className="bouton mt-8">Voir les événements</Link>
      </div>
    );
  }

  // Convertit le code ("padel") en texte lisible ("Padel")
  const libelleSport = LISTE_DES_SPORTS.find((sport) => sport.valeur === evenement.sport)?.libelle;
  const estOrganisateur = utilisateur && utilisateur.id === evenement.organisateur_id;
  const estComplet = evenement.nombre_places_restantes === 0;
  // Le bouton "favori" n'apparaît que pour une personne connectée, sur un événement qui n'est pas le sien et pas annulé
  const peutMettreEnFavori = utilisateur && !estOrganisateur && !evenement.est_annule;
  // Le chat est réservé à l'organisateur et aux personnes inscrites (le serveur le vérifie aussi)
  const peutAccederAuChat = utilisateur && (estOrganisateur || evenement.utilisateur_est_inscrit);

  // Remplissage de la barre : 8 inscrits sur 10 places = 80 %
  const pourcentageRempli = Math.round((evenement.nombre_de_participants / evenement.nombre_places_max) * 100);

  // Petite étiquette sous le titre. L'information est écrite en toutes lettres, pas seulement en couleur.
  let etiquetteStatut = null;
  if (evenement.est_annule) etiquetteStatut = "Annulé";
  else if (estComplet) etiquetteStatut = "Complet";
  else if (evenement.nombre_places_restantes <= 3) {
    etiquetteStatut = "Plus que " + evenement.nombre_places_restantes + " place" + (evenement.nombre_places_restantes > 1 ? "s" : "");
  }

  // Quel bouton afficher ? On décide ici, pour garder le JSX lisible.
  function afficherBoutonInscription() {
    if (evenement.est_annule) {
      return <p className="text-sm font-bold text-marine">Cet événement est annulé.</p>;
    }
    if (estOrganisateur) {
      return (
        <>
          <p className="text-sm font-bold text-marine">Tu organises cet événement.</p>
          <Link to={"/evenements/" + id + "/modifier"} className="bouton">Modifier</Link>
          <button type="button" onClick={annulerCetEvenement} disabled={actionEnCours} className="bouton-contour">
            Annuler l'événement
          </button>
        </>
      );
    }
    if (!utilisateur) {
      return <Link to="/connexion" className="bouton">Se connecter pour rejoindre</Link>;
    }
    if (evenement.utilisateur_est_inscrit) {
      return (
        <button type="button" onClick={changerInscription} disabled={actionEnCours} className="bouton-contour">
          {actionEnCours ? "..." : "Quitter l'événement"}
        </button>
      );
    }
    if (estComplet) {
      return <p className="text-sm font-bold text-marine">Complet</p>;
    }
    return (
      <button type="button" onClick={changerInscription} disabled={actionEnCours} className="bouton">
        {actionEnCours ? "..." : "Rejoindre l'événement"}
      </button>
    );
  }

  const classesTitreInfo = "text-xs font-bold uppercase tracking-[.09em] text-brand";

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
      <Link to="/evenements" className="lien-nav">← Tous les événements</Link>

      <div className="mt-10 text-center">
        <div className="sous-titre apparition">- {libelleSport} -</div>
        <h1 className="apparition mx-auto mt-4 max-w-4xl text-5xl leading-[1.05] md:text-6xl" style={{ animationDelay: "0.15s" }}>
          {evenement.titre}
        </h1>
        <p className="apparition mt-4 text-sm text-gris" style={{ animationDelay: "0.3s" }}>
          Organisé par{" "}
          <Link to={"/organisateurs/" + evenement.organisateur_id} className="font-bold text-brand hover:underline">
            {evenement.organisateur.name}
          </Link>
        </p>
        {etiquetteStatut && (
          <p className="mt-4">
            <span className="inline-block border border-marine px-3 py-1 text-[11px] font-bold uppercase tracking-[.09em] text-marine">
              {etiquetteStatut}
            </span>
          </p>
        )}
      </div>

      {/* La photo avec l'arche : seul le coin haut droit est arrondi */}
      <PhotoEvenement url={evenement.photo_url} alt={evenement.titre} className="mt-10 h-72 w-full rounded-tr-[130px] md:h-[460px]" />

      {/* items-start : chaque colonne garde sa hauteur (sinon la carte de droite s'étirerait et ne pourrait pas "coller") */}
      <div className="mt-10 grid items-start gap-8 lg:grid-cols-3">
        {/* Colonne de gauche : informations, puis carte */}
        <div className="bg-ciel p-2.5 shadow-carte lg:col-span-2">
          <div className="bg-white p-8 md:p-10">
            <h2 className="text-3xl">À propos de l'événement</h2>

            {/* whitespace-pre-line : respecte les retours à la ligne de la description */}
            {evenement.description && (
              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-gris">{evenement.description}</p>
            )}

            {/* dl / dt / dd : la balise HTML pour une liste « libellé : valeur » */}
            <dl className="mt-8 grid gap-6 border-t border-line pt-8 sm:grid-cols-3">
              <div>
                <dt className={classesTitreInfo}>Début</dt>
                <dd className="mt-1 text-sm text-marine">{formaterDate(evenement.date_debut)}</dd>
              </div>
              <div>
                <dt className={classesTitreInfo}>Fin</dt>
                <dd className="mt-1 text-sm text-marine">{formaterDate(evenement.date_fin)}</dd>
              </div>
              <div>
                <dt className={classesTitreInfo}>Lieu</dt>
                <dd className="mt-1 text-sm text-marine">{evenement.adresse}, {evenement.ville}</dd>
              </div>
            </dl>

            {/* Carte : seulement si l'adresse a pu être localisée par le back */}
            {evenement.latitude !== null && evenement.longitude !== null && (
              <div className="mt-8">
                <MiniCarte latitude={evenement.latitude} longitude={evenement.longitude} />
              </div>
            )}
          </div>
        </div>

        {/* Colonne de droite : réservation. lg:sticky : elle reste visible pendant qu'on lit la colonne de gauche. */}
        <aside className="bg-ciel p-2.5 shadow-carte lg:sticky lg:top-6">
          <div className="bg-white p-8">
            <p className="font-titre text-5xl leading-none text-marine">
              {evenement.nombre_de_participants} <span className="text-2xl text-gris">/ {evenement.nombre_places_max}</span>
            </p>
            <p className={"mt-2 " + classesTitreInfo}>
              {estComplet ? "Complet" : evenement.nombre_places_restantes + " place(s) restante(s)"}
            </p>

            {/* Barre de remplissage (décorative : le texte au-dessus dit déjà tout) */}
            <div className="mt-4 h-1 bg-line" aria-hidden="true">
              <div className="h-1 bg-brand" style={{ width: pourcentageRempli + "%" }} />
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {afficherBoutonInscription()}
              {peutMettreEnFavori && (
                <BoutonFavori key={evenement.id} evenementId={evenement.id}
                  estFavoriInitial={evenement.est_favori} avecTexte />
              )}
            </div>
            {messageAction && <p className="mt-3 text-sm font-bold text-brand">{messageAction}</p>}

            {peutMettreEnFavori && estComplet && !evenement.utilisateur_est_inscrit && (
              <p className="mt-3 text-xs leading-5 text-gris">
                Mets-le en favori : tu seras prévenu si une place se libère.
              </p>
            )}

            {!estOrganisateur && !evenement.est_annule && utilisateur && (
              <p className="mt-4 text-xs leading-5 text-gris">
                Tu peux te désinscrire à tout moment. Tu seras prévenu si l'événement change.
              </p>
            )}

            <h3 className="mt-8 border-t border-line pt-6 text-2xl">Participants</h3>
            {evenement.participants.length === 0 ? (
              <p className="mt-3 text-sm text-gris">Personne pour l'instant. Sois le premier !</p>
            ) : (
              <ul className="mt-3">
                {evenement.participants.map((participant) => (
                  <li key={participant.id} className="flex items-center gap-3 border-b border-line py-2.5 text-sm text-marine last:border-b-0">
                    {/* Un rond avec l'initiale : on n'a pas de photo de profil */}
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ciel text-xs font-bold" aria-hidden="true">
                      {participant.name.charAt(0).toUpperCase()}
                    </span>
                    {participant.name}
                    {participant.id === evenement.organisateur_id && (
                      <span className="ml-auto text-[11px] font-bold uppercase tracking-[.09em] text-brand">Organisateur</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {/* Après la fin de l'événement : le formulaire d'avis, ou l'avis déjà donné */}
      {(evenement.peut_donner_un_avis || evenement.mon_avis) && (
        <section className="mt-10 bg-ciel p-2.5 shadow-carte">
          <div className="bg-white p-8 md:p-10">
            <h2 className="text-3xl">Ton avis sur l'organisateur</h2>

            {evenement.mon_avis ? (
              <div className="mt-4">
                <Etoiles note={evenement.mon_avis.note} className="text-2xl" />
                {evenement.mon_avis.commentaire && (
                  <p className="mt-2 text-sm leading-7 text-gris">{evenement.mon_avis.commentaire}</p>
                )}
                <p className="mt-3 text-xs text-gris">Merci d'avoir donné ton avis.</p>
              </div>
            ) : (
              <>
                <p className="mt-2 text-sm text-gris">
                  L'événement est terminé : comment s'est passée la sortie avec {evenement.organisateur.name} ?
                </p>
                <FormulaireAvis
                  evenementId={evenement.id}
                  auSucces={(avis) => setEvenement({ ...evenement, peut_donner_un_avis: false, mon_avis: avis })}
                />
              </>
            )}
          </div>
        </section>
      )}

      {peutAccederAuChat ? (
        // key : si on passe d'un événement à un autre, le chat repart de zéro
        <ChatEvenement key={evenement.id} evenementId={evenement.id} peutEcrire={!evenement.est_annule} />
      ) : (
        <p className="mt-10 text-center text-sm text-gris">
          La discussion est réservée aux personnes inscrites à l'événement.
        </p>
      )}
    </div>
  );
}