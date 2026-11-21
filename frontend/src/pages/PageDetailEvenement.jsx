import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useUtilisateur } from "../contexts/ContexteUtilisateur";
import { recupererEvenement, rejoindreEvenement, quitterEvenement, annulerEvenement } from "../api/evenements";
import { LISTE_DES_SPORTS } from "../constantes/sports";
import { formaterDate } from "../utilitaires/dates";
import ChatEvenement from "../components/ChatEvenement";
import PhotoEvenement from "../components/PhotoEvenement";
import MiniCarte from "../components/MiniCarte";

export default function PageDetailEvenement() {
  // useParams lit les parties variables de l'URL : pour "/evenements/3", id vaut "3"
  // (équivalent de useRoute().params.id en Vue Router). C'est toujours du texte.
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
      .then(setEvenement)   // raccourci de .then((donnees) => setEvenement(donnees))
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

  if (chargement) return <p className="p-10 text-center">Chargement...</p>;
  if (erreur) return <p className="p-10 text-center font-bold">{erreur}</p>;

  // Convertit le code ("padel") en texte lisible ("Padel")
  const libelleSport = LISTE_DES_SPORTS.find((sport) => sport.valeur === evenement.sport)?.libelle;
  const estOrganisateur = utilisateur && utilisateur.id === evenement.organisateur_id;
  const estComplet = evenement.nombre_places_restantes === 0;
    // Le chat est réservé à l'organisateur et aux personnes inscrites (le serveur le vérifie aussi)
  const peutAccederAuChat = utilisateur && (estOrganisateur || evenement.utilisateur_est_inscrit);

  // Quel bouton afficher ? On décide ici, pour garder le JSX lisible.
  function afficherBoutonInscription() {
    if (evenement.est_annule) {
      return <p className="font-bold">Cet événement est annulé.</p>;
    }
    if (estOrganisateur) {
      return (
        <>
          <p className="font-bold">Tu organises cet événement.</p>
          <Link to={"/evenements/" + id + "/modifier"} className="bouton mt-4 text-center">Modifier</Link>
          <button type="button" onClick={annulerCetEvenement} disabled={actionEnCours}
            className="mt-3 border border-marine px-6 py-3 text-sm font-bold uppercase tracking-wider text-marine hover:bg-ciel disabled:opacity-50">
            Annuler l'événement
          </button>
        </>
      );
    }
    if (!utilisateur) {
      return <Link to="/connexion" className="bouton text-center">Se connecter pour rejoindre</Link>;
    }
    if (evenement.utilisateur_est_inscrit) {
      return (
        <button type="button" onClick={changerInscription} disabled={actionEnCours}
          className="bouton text-center disabled:opacity-50">
          {actionEnCours ? "..." : "Quitter l'événement"}
        </button>
      );
    }
    if (estComplet) {
      return <p className="font-bold">Complet</p>;
    }
    return (
      <button type="button" onClick={changerInscription} disabled={actionEnCours}
        className="bouton text-center disabled:opacity-50">
        {actionEnCours ? "..." : "Rejoindre l'événement"}
      </button>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:px-10">
      <div className="text-center">
        <div className="sous-titre">- {libelleSport} -</div>
        <h1 className="mt-4 text-5xl">{evenement.titre}</h1>
        <p className="mt-3 text-sm text-gris">Organisé par {evenement.organisateur.name}</p>
      </div>
      <PhotoEvenement url={evenement.photo_url} alt={evenement.titre} className="mt-8 h-72 w-full" />

      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {/* Colonne de gauche : les informations, puis la carte, dans le même bloc blanc */}
        <div className="border border-line bg-white p-8 md:col-span-2">
          <h2 className="text-2xl">Informations</h2>
          <p className="mt-4"><span className="font-bold text-marine">Début :</span> {formaterDate(evenement.date_debut)}</p>
          <p className="mt-1"><span className="font-bold text-marine">Fin :</span> {formaterDate(evenement.date_fin)}</p>
          <p className="mt-1"><span className="font-bold text-marine">Lieu :</span> {evenement.adresse}, {evenement.ville}</p>

          {/* whitespace-pre-line : respecte les retours à la ligne de la description */}
          {evenement.description && (
            <p className="mt-6 whitespace-pre-line">{evenement.description}</p>
          )}

          {/* Carte : seulement si l'adresse a pu être localisée par le back.
              L'adresse est déjà écrite dans "Lieu :" juste au-dessus, on ne la répète pas. */}
          {evenement.latitude !== null && evenement.longitude !== null && (
            <div className="mt-8">
              <MiniCarte latitude={evenement.latitude} longitude={evenement.longitude} />
            </div>
          )}
        </div>

        {/* Colonne de droite : places, bouton et participants */}
        <div className="border border-line bg-white p-8">
          <p className="font-titre text-4xl text-marine">
            {evenement.nombre_de_participants} / {evenement.nombre_places_max}
          </p>
          <p className="text-sm text-gris">
            {estComplet ? "Complet" : evenement.nombre_places_restantes + " place(s) restante(s)"}
          </p>

          <div className="mt-6 flex flex-col">{afficherBoutonInscription()}</div>
          {messageAction && <p className="mt-3 text-sm font-bold text-brand">{messageAction}</p>}

          <h3 className="mt-8 text-xl">Participants</h3>
          {evenement.participants.length === 0 ? (
            <p className="mt-2 text-sm text-gris">Personne pour l'instant. Sois le premier !</p>
          ) : (
            <ul className="mt-2 text-sm">
              {evenement.participants.map((participant) => (
                <li key={participant.id} className="border-b border-line py-2">{participant.name}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
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