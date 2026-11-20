<?php

namespace App\Notifications;

use App\Models\Evenement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

// "implements ShouldQueue" : l'envoi ne se fait pas pendant la requête, il est mis dans la file
// d'attente Redis. Le conteneur "queue" le traite en arrière-plan.
class EvenementModifie extends Notification implements ShouldQueue
{
    use Queueable;

    // Noms lisibles des champs, pour la phrase "Ce qui a changé : ..."
    private const LIBELLES_DES_CHAMPS = [
        'titre' => 'le titre',
        'adresse' => "l'adresse",
        'ville' => 'la ville',
        'date_debut' => 'la date de début',
        'date_fin' => 'la date de fin',
    ];

    // Promotion de constructeur : "public Evenement $evenement" déclare ET remplit la propriété.
    // Dans la file, Laravel ne stocke que l'id de l'événement et le recharge à l'exécution.
    public function __construct(public Evenement $evenement, public array $champs_modifies)
    {
    }

    // Par quels canaux envoyer ? Ici seulement l'e-mail.
    public function via(object $destinataire): array
    {
        return ['mail'];
    }

    // Construit l'e-mail. $destinataire est le User qui le reçoit.
    public function toMail(object $destinataire): MailMessage
    {
        $libelles_modifies = array_map(
            fn ($champ) => self::LIBELLES_DES_CHAMPS[$champ],
            $this->champs_modifies
        );

        // translatedFormat : jour et mois en français
        $date_debut_lisible = $this->evenement->date_debut->locale('fr')->translatedFormat('l j F Y, H:i');

        return (new MailMessage)
            ->subject('Événement modifié : ' . $this->evenement->titre)
            ->greeting('Bonjour ' . $destinataire->name . ',')
            ->line("L'organisateur a modifié l'événement « " . $this->evenement->titre . " ».")
            ->line('Ce qui a changé : ' . implode(', ', $libelles_modifies) . '.')
            ->line('Début : ' . $date_debut_lisible)
            ->line('Lieu : ' . $this->evenement->adresse . ', ' . $this->evenement->ville)
            ->action("Voir l'événement", config('app.frontend_url') . '/evenements/' . $this->evenement->id)
            ->salutation("À bientôt, l'équipe Collectif");
    }
}