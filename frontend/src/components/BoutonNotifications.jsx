import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  recupererNotifications,
  marquerNotificationLue,
  marquerToutesLues,
} from "../api/notifications";
import { formaterDepuis } from "../utilitaires/dates";

// On redemande les notifications toutes les 15 secondes
const DELAI_ACTUALISATION = 15000;

export default function BoutonNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [nombreNonLues, setNombreNonLues] = useState(0);
  const [ouvert, setOuvert] = useState(false);

  const conteneurRef = useRef(null);
  const naviguer = useNavigate();
  // useLocation = l'adresse actuelle (comme useRoute() en Vue). Le composant se met à jour quand elle change.
  const emplacement = useLocation();

  // --- 1. Aller chercher les notifications, puis recommencer toutes les 15 s ---
  // Ce useEffect dépend de l'adresse : à chaque changement de page il est
  // arrêté puis relancé (comme un watch sur la route en Vue).
  useEffect(() => {
    let ignorer = false;   // passe à true si le composant disparaît pendant une requête

    async function charger() {
      // Onglet en arrière-plan : on ne sollicite pas le serveur pour rien
      if (document.hidden) return;

      try {
        const reponse = await recupererNotifications();
        if (ignorer) return;

        let liste = reponse.notifications;
        let nombre = reponse.nombre_non_lues;

        // Si on est déjà sur la page d'un événement, ses notifications n'ont plus
        // de raison d'être non lues : on les marque lues tout de suite.
        // (regex : "/evenements/" suivi d'un nombre, et rien d'autre)
        const correspondance = emplacement.pathname.match(/^\/evenements\/(\d+)$/);
        const identifiantPage = correspondance ? Number(correspondance[1]) : null;

        if (identifiantPage) {
          const aMarquer = liste.filter((n) => !n.est_lue && n.evenement_id === identifiantPage);

          if (aMarquer.length > 0) {
            // Promise.all : lance les requêtes en même temps et attend qu'elles soient toutes finies
            await Promise.all(aMarquer.map((n) => marquerNotificationLue(n.id)));
            liste = liste.map((n) => (n.evenement_id === identifiantPage ? { ...n, est_lue: true } : n));
            nombre = nombre - aMarquer.length;
          }
        }

        if (ignorer) return;
        setNotifications(liste);
        setNombreNonLues(Math.max(0, nombre));
      } catch {
        // Erreur réseau ponctuelle : on réessaiera au prochain tour, inutile d'afficher quoi que ce soit
      }
    }

    charger();   // une fois tout de suite...
    const minuteur = setInterval(charger, DELAI_ACTUALISATION);   // ... puis toutes les 15 s

    // Nettoyage : on arrête le minuteur (comme onUnmounted en Vue)
    return () => {
      ignorer = true;
      clearInterval(minuteur);
    };
  }, [emplacement.pathname]);

  // --- 2. Fermer la liste quand on clique en dehors (même principe que MenuUtilisateur) ---
  useEffect(() => {
    function fermerSiClicDehors(evenement) {
      if (conteneurRef.current && !conteneurRef.current.contains(evenement.target)) {
        setOuvert(false);
      }
    }
    document.addEventListener("mousedown", fermerSiClicDehors);
    return () => document.removeEventListener("mousedown", fermerSiClicDehors);
  }, []);

  // --- 3. Clic sur une notification : la marquer lue, puis ouvrir l'événement ---
  async function ouvrirNotification(notification) {
    setOuvert(false);

    if (!notification.est_lue) {
      // Affichage "optimiste" : on met à jour l'écran tout de suite, sans attendre le serveur
      setNotifications((anciennes) =>
        anciennes.map((n) => (n.id === notification.id ? { ...n, est_lue: true } : n))
      );
      setNombreNonLues((nombre) => Math.max(0, nombre - 1));
      marquerNotificationLue(notification.id).catch(() => {});
    }

    naviguer("/evenements/" + notification.evenement_id);
  }

  async function toutMarquerCommeLu() {
    setNotifications((anciennes) => anciennes.map((n) => ({ ...n, est_lue: true })));
    setNombreNonLues(0);
    marquerToutesLues().catch(() => {});
  }

  return (
    <div ref={conteneurRef} className="relative">
      <button
        type="button"
        onClick={() => setOuvert(!ouvert)}
        aria-label={
          nombreNonLues > 0
            ? "Notifications : " + nombreNonLues + " non lue(s)"
            : "Notifications"
        }
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-marine text-marine hover:bg-ciel"
      >
        {/* Icône de cloche (SVG dessiné à la main, aucune bibliothèque à installer) */}
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>

        {/* Pastille avec le nombre de non lues : affichée seulement s'il y en a */}
        {nombreNonLues > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-bold text-white">
            {nombreNonLues > 9 ? "9+" : nombreNonLues}
          </span>
        )}
      </button>

      {ouvert && (
        <div className="fixed inset-x-3 top-[68px] z-50 border border-line bg-white shadow-carte md:absolute md:inset-x-auto md:right-0 md:top-auto md:mt-2 md:w-80">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <span className="text-sm font-bold text-marine">Notifications</span>
            {nombreNonLues > 0 && (
              <button type="button" onClick={toutMarquerCommeLu} className="text-xs font-semibold text-brand hover:underline">
                Tout marquer comme lu
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gris">Aucune notification pour le moment.</p>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification.id} className="border-b border-line last:border-b-0">
                  <button
                    type="button"
                    onClick={() => ouvrirNotification(notification)}
                    // Non lue : fond ciel clair + petit trait bleu à gauche
                    className={
                      "block w-full px-5 py-3 text-left hover:bg-ciel " +
                      (notification.est_lue ? "" : "border-l-4 border-brand bg-ciel/40")
                    }
                  >
                    <span className={"block text-sm text-marine " + (notification.est_lue ? "font-medium" : "font-bold")}>
                      {notification.titre}
                    </span>
                    <span className="mt-1 block text-sm text-gris">{notification.detail}</span>
                    <span className="mt-1 block text-xs text-gris">{formaterDepuis(notification.created_at)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}