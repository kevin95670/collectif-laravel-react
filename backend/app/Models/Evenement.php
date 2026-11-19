<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class Evenement extends Model
{
   
    // Liste des sports acceptés. self::LISTE_DES_SPORTS ou Evenement::LISTE_DES_SPORTS pour la lire.
    public const LISTE_DES_SPORTS = [
        'football', 'running', 'basket', 'randonnee',
        'padel', 'tennis', 'natation', 'velo', 'autre',
    ];

    // Champs autorisés pour Evenement::create([...]) : protège contre le mass assignment.
    protected $fillable = [
        'titre', 'description', 'sport', 'adresse', 'ville',
        'date_debut', 'date_fin', 'nombre_places_max',
        'est_annule', 'organisateur_id',
    ];

    // Conversion automatique des colonnes en types PHP
    // (date_debut devient un objet Carbon, pas un simple texte).
    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
        'est_annule' => 'boolean',
    ];

    // Un événement appartient à un organisateur (un User).
    // Par défaut Laravel chercherait une colonne "user_id" : on indique le vrai nom.
    public function organisateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organisateur_id');
    }
}