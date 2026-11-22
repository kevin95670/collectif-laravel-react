import { useEffect, useRef, useState } from "react";
import { useUtilisateur } from "../contexts/ContexteUtilisateur";
import { envoyerMessage, recupererMessages } from "../api/messages";
import { formaterHeureMessage } from "../utilitaires/dates";

// Props :
// - evenementId : l'événement dont on affiche le chat
// - peutEcrire : false si l'événement est annulé (le chat reste lisible)
export default function ChatEvenement({ evenementId, peutEcrire }) {
  const { utilisateur } = useUtilisateur();

  const [messages, setMessages] = useState([]);
  const [chargementInitial, setChargementInitial] = useState(true);
  const [erreurChargement, setErreurChargement] = useState("");

  const [texte, setTexte] = useState("");                   // le message en cours d'écriture
  const [messageCite, setMessageCite] = useState(null);     // le message auquel on répond (ou null)
  const [erreurEnvoi, setErreurEnvoi] = useState("");
  const [nouveauxMessagesNonVus, setNouveauxMessagesNonVus] = useState(false);

  // useRef : une valeur qui survit aux réaffichages, mais dont le changement NE réaffiche PAS le composant.
  // Idéal pour des informations "techniques" qu'on lit dans des fonctions.
  const zoneMessagesRef = useRef(null);                // l'élément HTML de la zone qui défile
  const champTexteRef = useRef(null);                  // le champ de saisie (pour lui rendre le focus)
  const identifiantDernierMessage = useRef(0);         // le plus grand id reçu (pour ?apres_id=)
  const etaitEnBas = useRef(true);                     // la personne était-elle en bas de la conversation ?
  const forcerDescente = useRef(false);                // vrai quand elle vient d'envoyer un message
  const nombreMessagesPrecedent = useRef(0);

  // ----- Recevoir les messages : un premier chargement, puis un rafraîchissement toutes les 3 secondes -----
  useEffect(() => {
    let ignorer = false;

    // Ajoute les messages reçus à la liste, sans doublons
    function ajouterMessagesRecus(messagesRecus) {
      if (messagesRecus.length === 0) return;

      // La forme "fonction" de setMessages reçoit la liste ACTUELLE : indispensable ici,
      // car cette fonction vit longtemps et verrait sinon une vieille liste.
      setMessages((messagesActuels) => {
        const identifiantsConnus = new Set(messagesActuels.map((message) => message.id));
        const reellementNouveaux = messagesRecus.filter((message) => !identifiantsConnus.has(message.id));
        return [...messagesActuels, ...reellementNouveaux];
      });

      const plusGrandIdentifiant = Math.max(...messagesRecus.map((message) => message.id));
      identifiantDernierMessage.current = Math.max(identifiantDernierMessage.current, plusGrandIdentifiant);
    }

    async function chargerMessages() {
      // Onglet en arrière-plan : on ne fatigue pas le serveur pour rien
      if (document.hidden) return;

      try {
        // 0 se transforme en null : le premier appel demande les 50 derniers messages,
        // les suivants seulement les nouveaux.
        const messagesRecus = await recupererMessages(evenementId, identifiantDernierMessage.current || null);
        if (ignorer) return;
        ajouterMessagesRecus(messagesRecus);
        setErreurChargement("");
      } catch {
        if (!ignorer) setErreurChargement("Impossible de charger les messages.");
      } finally {
        if (!ignorer) setChargementInitial(false);
      }
    }

    chargerMessages();                                    // tout de suite
    const minuteur = setInterval(chargerMessages, 3000);  // puis toutes les 3 secondes

    // Nettoyage : sans lui, le minuteur continuerait de tourner même après avoir quitté la page.
    return () => {
      ignorer = true;
      clearInterval(minuteur);
    };
  }, [evenementId]);

  // ----- Défilement : à chaque nouveau message, descendre... ou prévenir -----
  useEffect(() => {
    const zone = zoneMessagesRef.current;
    if (!zone) return;

    const ilYADeNouveauxMessages = messages.length > nombreMessagesPrecedent.current;
    nombreMessagesPrecedent.current = messages.length;
    if (!ilYADeNouveauxMessages) return;

    if (forcerDescente.current || etaitEnBas.current) {
      // La personne lisait le bas (ou vient d'écrire) : on descend automatiquement
      zone.scrollTop = zone.scrollHeight;
      forcerDescente.current = false;
      setNouveauxMessagesNonVus(false);
    } else {
      // Elle a remonté la conversation : on ne la dérange pas, on affiche un bouton
      setNouveauxMessagesNonVus(true);
    }
  }, [messages]);

  // Appelée quand la personne fait défiler la zone : on retient si elle est en bas
  function surDefilement() {
    const zone = zoneMessagesRef.current;
    etaitEnBas.current = zone.scrollHeight - zone.scrollTop - zone.clientHeight < 60;
    if (etaitEnBas.current) setNouveauxMessagesNonVus(false);
  }

  function descendreEnBas() {
    const zone = zoneMessagesRef.current;
    zone.scrollTop = zone.scrollHeight;
  }

  function repondreA(message) {
    setMessageCite(message);
    champTexteRef.current.focus();   // le curseur est directement dans le champ
  }

  // ----- Envoyer : affichage "optimiste" -----
  // On affiche le message tout de suite, avant la réponse du serveur : le chat paraît instantané.
  // Si l'envoi échoue, on retire le message et on rend le texte à la personne.
  async function envoyer() {
    const contenu = texte.trim();
    if (contenu === "") return;

    const messageCiteEnvoye = messageCite;
    const identifiantTemporaire = "en-attente-" + Date.now();

    const messageTemporaire = {
      id: identifiantTemporaire,
      contenu: contenu,
      created_at: new Date().toISOString(),
      auteur: { id: utilisateur.id, name: utilisateur.name },
      message_cite: messageCiteEnvoye,
      enAttente: true,
    };

    setMessages((messagesActuels) => [...messagesActuels, messageTemporaire]);
    setTexte("");
    setMessageCite(null);
    setErreurEnvoi("");
    forcerDescente.current = true;

    try {
      const messageEnregistre = await envoyerMessage(evenementId, contenu, messageCiteEnvoye?.id ?? null);

      // On remplace le message temporaire par le vrai (avec son vrai id).
      // Le rafraîchissement a pu l'apporter avant : on évite alors le doublon.
      setMessages((messagesActuels) => {
        const sansTemporaire = messagesActuels.filter((message) => message.id !== identifiantTemporaire);
        const dejaPresent = sansTemporaire.some((message) => message.id === messageEnregistre.id);
        return dejaPresent ? sansTemporaire : [...sansTemporaire, messageEnregistre];
      });
      identifiantDernierMessage.current = Math.max(identifiantDernierMessage.current, messageEnregistre.id);
    } catch (erreurCapturee) {
      setMessages((messagesActuels) => messagesActuels.filter((message) => message.id !== identifiantTemporaire));
      setTexte(contenu);
      setMessageCite(messageCiteEnvoye);
      setErreurEnvoi(erreurCapturee.erreurs?.contenu?.[0] ?? erreurCapturee.message);
    }
  }

  function surTouchePressee(evenementClavier) {
    // Entrée envoie ; Maj + Entrée passe à la ligne
    if (evenementClavier.key === "Enter" && !evenementClavier.shiftKey) {
      evenementClavier.preventDefault();
      envoyer();
    }
  }

  return (
    // Même cadre que les autres blocs : ciel, puis intérieur blanc
    <section className="mt-10 bg-ciel p-2.5 shadow-carte">
      <div className="bg-white">
        <div className="border-b border-line px-6 py-5">
          <div className="sous-titre">- les inscrits discutent -</div>
          <h2 className="mt-1 text-3xl">La discussion</h2>
        </div>

        {/* "relative" : le bouton "nouveaux messages" se place par rapport à ce bloc */}
        <div className="relative">
          <div ref={zoneMessagesRef} onScroll={surDefilement} className="h-96 space-y-4 overflow-y-auto p-6">
            {chargementInitial && <p className="text-center text-sm text-gris">Chargement...</p>}
            {erreurChargement && <p className="text-center text-sm font-bold text-brand">{erreurChargement}</p>}
            {!chargementInitial && !erreurChargement && messages.length === 0 && (
              <p className="text-center text-sm text-gris">Aucun message pour l'instant. Lance la discussion !</p>
            )}

            {messages.map((message) => {
              const estMien = message.auteur.id === utilisateur.id;

              return (
                <div key={message.id} className={"flex " + (estMien ? "justify-end" : "justify-start")}>
                  {/* Un coin arrondi seulement (clin d'œil à l'arche) : en haut à gauche pour moi, en haut à droite pour les autres */}
                  <div className={"max-w-[80%] px-5 py-3 " + (estMien ? "rounded-tl-3xl bg-ciel" : "rounded-tr-3xl bg-creme")}>
                    {!estMien && <p className="text-xs font-bold text-brand">{message.auteur.name}</p>}

                    {/* La citation, si ce message est une réponse */}
                    {message.message_cite && (
                      <div className="my-1 border-l-2 border-brand bg-white/60 px-3 py-1 text-xs">
                        <p className="font-bold text-marine">{message.message_cite.auteur.name}</p>
                        <p className="line-clamp-2 text-gris">{message.message_cite.contenu}</p>
                      </div>
                    )}

                    {/* whitespace-pre-line : respecte les retours à la ligne ; break-words : coupe les mots trop longs */}
                    <p className="whitespace-pre-line break-words text-sm text-marine">{message.contenu}</p>

                    <div className="mt-1 flex items-center justify-between gap-4 text-xs text-gris">
                      <span>{message.enAttente ? "Envoi..." : formaterHeureMessage(message.created_at)}</span>
                      {peutEcrire && !message.enAttente && (
                        <button type="button" onClick={() => repondreA(message)} className="font-bold hover:text-marine">
                          Répondre
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {nouveauxMessagesNonVus && (
            <button
              type="button"
              onClick={descendreEnBas}
              className="bouton bouton-petit absolute bottom-4 left-1/2 -translate-x-1/2"
            >
              Nouveaux messages ↓
            </button>
          )}
        </div>

        {peutEcrire ? (
          <div className="border-t border-line p-4">
            {/* Bandeau "Réponse à ..." */}
            {messageCite && (
              <div className="mb-3 flex items-start justify-between gap-4 border-l-2 border-brand bg-creme px-3 py-2 text-xs">
                <div>
                  <p className="font-bold text-marine">Réponse à {messageCite.auteur.name}</p>
                  <p className="line-clamp-1 text-gris">{messageCite.contenu}</p>
                </div>
                <button type="button" onClick={() => setMessageCite(null)} aria-label="Annuler la réponse" className="font-bold text-marine">
                  ✕
                </button>
              </div>
            )}

            {erreurEnvoi && <p className="mb-2 text-sm font-bold text-brand">{erreurEnvoi}</p>}

            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea
                ref={champTexteRef}
                rows={2}
                maxLength={1000}
                value={texte}
                onChange={(evenement) => setTexte(evenement.target.value)}
                onKeyDown={surTouchePressee}
                placeholder="Écris un message... (Entrée pour envoyer)"
                className="flex-1 resize-none border border-line bg-white px-4 py-3 text-sm"
              />
              <button type="button" onClick={envoyer} disabled={texte.trim() === ""} className="bouton disabled:opacity-50">
                Envoyer
              </button>
            </div>
          </div>
        ) : (
          <p className="border-t border-line p-4 text-center text-sm text-gris">
            Cet événement est annulé : la discussion est en lecture seule.
          </p>
        )}
      </div>
    </section>
  );
}