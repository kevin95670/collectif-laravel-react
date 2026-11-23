<?php

namespace App\Notifications;

use App\Models\Evenement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PlaceLiberee extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Evenement $evenement)
    {
    }

    public function via(object $destinataire): array
    {
        return ['mail', 'database'];
    }

    public function toArray(object $destinataire): array
    {
        return [
            'evenement_id' => $this->evenement->id,
            'titre' => "Une place s'est libérée · " . $this->evenement->titre,
            'detail' => "Cet événement de tes favoris n'est plus complet.",
        ];
    }

    public function toMail(object $destinataire): MailMessage
    {
        $date_debut_lisible = $this->evenement->date_debut->locale('fr')->translatedFormat('l j F Y, H:i');

        return (new MailMessage)
            ->subject("Une place s'est libérée : " . $this->evenement->titre)
            ->greeting('Bonjour ' . $destinataire->name . ',')
            ->line("Une place vient de se libérer pour « " . $this->evenement->titre . " », prévu le " . $date_debut_lisible
                . ' (' . $this->evenement->adresse . ', ' . $this->evenement->ville . ').')
            ->line("Tu reçois ce message parce que cet événement est dans tes favoris. La place va au premier qui la prend.")
            ->action("Voir l'événement", config('app.frontend_url') . '/evenements/' . $this->evenement->id)
            ->salutation("À bientôt, l'équipe Collectif");
    }
}