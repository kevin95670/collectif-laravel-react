<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EvenementFactory extends Factory
{
    // Les valeurs par défaut d'un événement de test : à venir, non annulé, 10 places
    public function definition(): array
    {
        $date_debut = fake()->dateTimeBetween('+2 days', '+30 days');

        return [
            'titre' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'sport' => 'football',
            'adresse' => fake()->streetAddress(),
            'ville' => fake()->city(),
            'date_debut' => $date_debut,
            'date_fin' => (clone $date_debut)->modify('+2 hours'),
            'nombre_places_max' => 10,
            'est_annule' => false,
            // User::factory() : crée un organisateur à la volée si on n'en précise pas
            'organisateur_id' => User::factory(),
        ];
    }

    // Variantes : Evenement::factory()->annule()->create()
    public function annule(): static
    {
        return $this->state(fn () => ['est_annule' => true]);
    }

    public function passe(): static
    {
        return $this->state(fn () => [
            'date_debut' => now()->subDays(3),
            'date_fin' => now()->subDays(3)->addHours(2),
        ]);
    }
}