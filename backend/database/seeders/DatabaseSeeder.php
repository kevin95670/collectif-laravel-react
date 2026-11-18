<?php

namespace Database\Seeders;

use App\Models\Evenement;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // On crée un organisateur. La factory remplit le mot de passe (valeur : "password").
        // La colonne s'appelle "name" car c'est le nom imposé par la table users de Laravel.
        $organisateur = User::factory()->create([
            'name' => 'Kevin L.',
            'email' => 'kevin@collectif.test',
        ]);

        // now() donne la date du jour ; addDays() décale (méthodes de Carbon).
        Evenement::create([
            'titre' => 'Foot à 5 entre amis',
            'description' => 'Match amical, tous niveaux. Prévoir des chaussures de salle.',
            'adresse' => 'Urban Soccer, Lyon 7e',
            'date_debut' => now()->addDays(6)->setTime(20, 0),
            'date_fin' => now()->addDays(6)->setTime(21, 30),
            'nombre_places_max' => 10,
            'organisateur_id' => $organisateur->id,
        ]);

        Evenement::create([
            'titre' => 'Running 10 km au Parc de la Tête d\'Or',
            'description' => 'Allure libre, on part ensemble et on s\'attend.',
            'adresse' => 'Parc de la Tête d\'Or, Lyon 6e',
            'date_debut' => now()->addDays(7)->setTime(9, 30),
            'date_fin' => now()->addDays(7)->setTime(11, 0),
            'nombre_places_max' => 20,
            'organisateur_id' => $organisateur->id,
        ]);

        Evenement::create([
            'titre' => 'Basket 3x3 du mercredi',
            'description' => 'Tournoi rapide en équipes de 3.',
            'adresse' => 'Playground de Gerland, Lyon 7e',
            'date_debut' => now()->addDays(10)->setTime(19, 0),
            'date_fin' => now()->addDays(10)->setTime(21, 0),
            'nombre_places_max' => 6,
            'organisateur_id' => $organisateur->id,
        ]);

        Evenement::create([
            'titre' => 'Randonnée des Monts d\'Or',
            'description' => 'Boucle d\'environ 12 km, dénivelé modéré.',
            'adresse' => 'Départ : Saint-Cyr-au-Mont-d\'Or',
            'date_debut' => now()->addDays(14)->setTime(8, 30),
            'date_fin' => now()->addDays(14)->setTime(13, 0),
            'nombre_places_max' => 12,
            'organisateur_id' => $organisateur->id,
        ]);
    }
}