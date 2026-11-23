<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Avis extends Model
{
    // Le nom de la table est donné explicitement : Laravel essaierait de deviner le pluriel de "avis"
    protected $table = 'avis';

    protected $fillable = ['evenement_id', 'auteur_id', 'note', 'commentaire'];

    protected $casts = [
        'note' => 'integer',
    ];

    public function evenement(): BelongsTo
    {
        return $this->belongsTo(Evenement::class, 'evenement_id');
    }

    // Par défaut Laravel chercherait "user_id" : on indique le vrai nom
    public function auteur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'auteur_id');
    }
}