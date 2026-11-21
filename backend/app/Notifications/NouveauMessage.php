<?php

namespace App\Notifications;

use App\Models\Evenement;
use App\Models\Message;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

// Notification enregistrée en base (canal "database") : pas d'e-mail ici, ce serait trop de courrier.
class NouveauMessage extends Notification
{
    public function __construct(
        public Evenement $evenement,
        public Message $message,
        public int $nombre_messages   // combien de messages non lus sont regroupés dans cette notification
    ) {
    }

    // Le canal "database" enregistre la notification dans la table notifications
    public function via(object $destinataire): array
    {
        return ['database'];
    }

    // Les données enregistrées (stockées en JSON dans la colonne "data").
    // On prépare ici les textes tout faits : React n'aura qu'à les afficher.
    public function toArray(object $destinataire): array
    {
        $titre = $this->nombre_messages > 1
            ? $this->nombre_messages . ' nouveaux messages · ' . $this->evenement->titre
            : 'Nouveau message · ' . $this->evenement->titre;

        return [
            'evenement_id' => $this->evenement->id,
            'nombre_messages' => $this->nombre_messages,
            'titre' => $titre,
            // Str::limit coupe le message après 80 caractères et ajoute "..."
            'detail' => $this->message->auteur->name . ' : ' . Str::limit($this->message->contenu, 80),
        ];
    }
}