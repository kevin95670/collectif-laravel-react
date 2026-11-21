<?php

namespace App\Notifications;

use App\Models\Evenement;
use App\Models\User;
use Illuminate\Notifications\Notification;

class NouveauParticipant extends Notification
{
    public function __construct(public Evenement $evenement, public User $participant)
    {
    }

    public function via(object $destinataire): array
    {
        return ['database'];
    }

    public function toArray(object $destinataire): array
    {
        return [
            'evenement_id' => $this->evenement->id,
            'titre' => 'Nouveau participant · ' . $this->evenement->titre,
            'detail' => $this->participant->name . ' a rejoint ton événement.',
        ];
    }
}