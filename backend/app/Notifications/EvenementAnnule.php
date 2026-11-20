<?php

namespace App\Notifications;

use App\Models\Evenement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EvenementAnnule extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Evenement $evenement)
    {
    }

    public function via(object $destinataire): array
    {
        return ['mail'];
    }

    public function toMail(object $destinataire): MailMessage
    {
        $date_debut_lisible = $this->evenement->date_debut->locale('fr')->translatedFormat('l j F Y, H:i');

        return (new MailMessage)
            ->subject('Événement annulé : ' . $this->evenement->titre)
            ->greeting('Bonjour ' . $destinataire->name . ',')
            ->line("L'événement « " . $this->evenement->titre . " », prévu le " . $date_debut_lisible
                . ' (' . $this->evenement->adresse . ', ' . $this->evenement->ville . '), a été annulé par son organisateur.')
            ->action('Trouver un autre événement', config('app.frontend_url') . '/evenements')
            ->salutation("À bientôt, l'équipe Collectif");
    }
}