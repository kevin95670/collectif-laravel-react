<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\User;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Services\GeocodageAdresse;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Evenement extends Model
{

    use HasFactory;
   
    // Liste des sports acceptés. self::LISTE_DES_SPORTS ou Evenement::LISTE_DES_SPORTS pour la lire.
    public const LISTE_DES_SPORTS = [
        'football', 'running', 'basket', 'randonnee',
        'padel', 'tennis', 'natation', 'velo', 'autre',
    ];

    // $appends : ajoute l'attribut calculé "photo_url" à chaque conversion en JSON
    protected $appends = ['photo_url'];

    // Champs autorisés pour Evenement::create([...]) : protège contre le mass assignment.
    protected $fillable = [
        'titre', 'description', 'sport', 'adresse', 'ville',
        'date_debut', 'date_fin', 'nombre_places_max',
        'est_annule', 'organisateur_id',
        'photo_chemin',
    ];

    // Conversion automatique des colonnes en types PHP
    // (date_debut devient un objet Carbon, pas un simple texte).
    protected $casts = [
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
        'est_annule' => 'boolean',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    // booted() est appelée une fois au démarrage du modèle : on y branche des "écouteurs" d'événements Eloquent.
    protected static function booted(): void
    {
        // "saving" se déclenche juste avant chaque enregistrement (création ET modification)
        static::saving(function (Evenement $evenement) {
            // isDirty : est-ce que ces champs viennent d'être changés (et pas encore enregistrés) ?
            $adresse_a_change = $evenement->isDirty(['adresse', 'ville']);
            $coordonnees_manquantes = $evenement->latitude === null;

            if (! $adresse_a_change && ! $coordonnees_manquantes) {
                return;   // rien à recalculer
            }

            // app(...) : demande à Laravel de fabriquer le service (comme l'injection de dépendances en Symfony)
            $coordonnees = app(GeocodageAdresse::class)
                ->trouver_coordonnees($evenement->adresse, $evenement->ville);

            // ?? null : si l'adresse n'est pas trouvée, on remet les coordonnées à vide
            $evenement->latitude = $coordonnees['latitude'] ?? null;
            $evenement->longitude = $coordonnees['longitude'] ?? null;
        });
    }

    // Un événement appartient à un organisateur (un User).
    // Par défaut Laravel chercherait une colonne "user_id" : on indique le vrai nom.
    public function organisateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'organisateur_id');
    }

    // Relation plusieurs-à-plusieurs : un événement a plusieurs participants (User),
    // un User participe à plusieurs événements. Les liens sont dans la table "inscriptions".
    // Arguments : modèle lié, nom de la table, clé de CE modèle, clé de l'AUTRE modèle.
    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'inscriptions', 'evenement_id', 'user_id')
            ->withTimestamps();   // remplit created_at/updated_at de la table de liaison
    }

    // Un événement a plusieurs messages (hasMany : la clé étrangère est dans la table messages)
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'evenement_id');
    }

    // Attribut calculé ("accesseur") : $evenement->photo_url donne l'adresse complète de l'image.
    // Le nom de la méthode (photoUrl) est imposé par Laravel : camelCase de l'attribut photo_url.
    protected function photoUrl(): Attribute
    {
        return Attribute::get(function () {
            if ($this->photo_chemin === null) {
                return null;
            }
            // Storage::url donne "http://localhost:8000/storage/evenements/abc123.jpg"
            return Storage::disk('public')->url($this->photo_chemin);
        });
    }

    // Les personnes qui ont mis cet événement en favori (le sens inverse de User::evenements_favoris)
    public function utilisateurs_favoris(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'favoris', 'evenement_id', 'user_id')
            ->withTimestamps();
    }
}