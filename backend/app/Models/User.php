<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relation inverse de Evenement::organisateur() : un User organise plusieurs événements.
    // hasMany : la clé étrangère (organisateur_id) se trouve dans la table des événements.
    public function evenements_organises(): HasMany
    {
        return $this->hasMany(Evenement::class, 'organisateur_id');
    }

    // Relation inverse de Evenement::participants() : les événements auxquels le User est inscrit.
    // Mêmes arguments que dans Evenement, mais les deux clés sont inversées.
    public function evenements_inscrits(): BelongsToMany
    {
        return $this->belongsToMany(Evenement::class, 'inscriptions', 'user_id', 'evenement_id')
            ->withTimestamps();
    }
}
