<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    protected $fillable = ['evenement_id', 'auteur_id', 'contenu', 'reponse_a_id'];

    // Un message appartient à un événement
    public function evenement(): BelongsTo
    {
        return $this->belongsTo(Evenement::class, 'evenement_id');
    }

    // Un message a un auteur (un User)
    public function auteur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'auteur_id');
    }

    // Le message cité quand celui-ci est une réponse (relation vers la même table)
    public function message_cite(): BelongsTo
    {
        return $this->belongsTo(Message::class, 'reponse_a_id');
    }
}