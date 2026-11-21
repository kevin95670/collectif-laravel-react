<?php

namespace App\Http\Controllers;

use App\Models\Evenement;
use App\Models\Message;
use App\Notifications\NouveauMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class MessageController extends Controller
{
    // Les relations chargées avec chaque message : l'auteur, et le message cité avec son auteur.
    private const RELATIONS_A_CHARGER = [
        'auteur:id,name',
        'message_cite:id,contenu,auteur_id',
        'message_cite.auteur:id,name',
    ];

    // GET /api/evenements/{evenement}/messages
    // Sans paramètre : les 50 derniers messages.
    // Avec ?apres_id=12 : uniquement les messages plus récents que le n°12 (pour le polling).
    public function lister(Request $requete, Evenement $evenement): JsonResponse
    {
        Gate::authorize('lire_messages', $evenement);

        $requete->validate(['apres_id' => 'nullable|integer|min:0']);
        $identifiant_dernier_message_connu = $requete->query('apres_id');

        $requete_messages = $evenement->messages()->with(self::RELATIONS_A_CHARGER);

        if ($identifiant_dernier_message_connu !== null) {
            $messages = $requete_messages
                ->where('id', '>', $identifiant_dernier_message_connu)
                ->orderBy('id')
                ->get();
        } else {
            $messages = $requete_messages
                ->orderByDesc('id')
                ->limit(50)
                ->get()
                ->reverse()
                ->values();
        }

        return response()->json($messages);
    }

    // POST /api/evenements/{evenement}/messages
    public function envoyer(Request $requete, Evenement $evenement): JsonResponse
    {
        Gate::authorize('ecrire_message', $evenement);

        $donnees_validees = $requete->validate([
            'contenu' => 'required|string|max:1000',
            // On ne peut répondre qu'à un message DE CE MÊME événement
            'reponse_a_id' => [
                'nullable',
                'integer',
                Rule::exists('messages', 'id')->where('evenement_id', $evenement->id),
            ],
        ]);

        $message = $evenement->messages()->create([
            'auteur_id' => $requete->user()->id,
            'contenu' => $donnees_validees['contenu'],
            'reponse_a_id' => $donnees_validees['reponse_a_id'] ?? null,
        ]);

        $message->load(self::RELATIONS_A_CHARGER);

        $this->prevenir_les_autres_membres($evenement, $message);

        return response()->json($message, 201);
    }

    // Crée (ou met à jour) la notification "nouveau message" de chaque membre de l'événement
    private function prevenir_les_autres_membres(Evenement $evenement, Message $message): void
    {
        // Les destinataires : tous les participants + l'organisateur, sauf l'auteur du message
        $destinataires = $evenement->participants()->get();
        $destinataires->push($evenement->organisateur);
        $destinataires = $destinataires
            ->unique('id')   // l'organisateur peut aussi être inscrit : on évite le doublon
            ->reject(fn ($membre) => $membre->id === $message->auteur_id);

        foreach ($destinataires as $destinataire) {
            // Regroupement : une seule notification NON LUE par événement.
            // On cherche celle qui existe déjà pour cet événement...
            $notification_existante = $destinataire->unreadNotifications()
                ->where('type', NouveauMessage::class)
                ->get()
                ->first(fn ($notification) => $notification->data['evenement_id'] === $evenement->id);

            // ... on reprend son compteur (?-> et ?? : 0 s'il n'y en a pas), on la supprime, puis on la recrée.
            // La nouvelle remonte ainsi en haut de la liste, avec le compteur augmenté.
            $nombre_messages = ($notification_existante?->data['nombre_messages'] ?? 0) + 1;
            $notification_existante?->delete();

            $destinataire->notify(new NouveauMessage($evenement, $message, $nombre_messages));
        }
    }
}