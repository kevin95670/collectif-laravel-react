<?php

namespace Tests\Feature;

use App\Models\Evenement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProximiteEvenementsTest extends TestCase
{
    use RefreshDatabase;

    // Crée un événement à venir, puis fixe ses coordonnées directement en base
    private function creer_evenement_a(string $titre, ?float $latitude, ?float $longitude): Evenement
    {
        $evenement = Evenement::factory()->create([
            'titre' => $titre,
            'date_debut' => now()->addDays(2),
            'date_fin' => now()->addDays(2)->addHours(2),
        ]);

        // update() sur la requête (et non sur le modèle) ne déclenche pas le géocodage
        Evenement::where('id', $evenement->id)->update(['latitude' => $latitude, 'longitude' => $longitude]);

        return $evenement;
    }

    public function test_les_evenements_sont_tries_du_plus_proche_au_plus_loin(): void
    {
        // Créés dans cet ordre exprès : l'ordre par défaut (par identifiant) serait Paris, Marseille, Lyon
        $this->creer_evenement_a('Paris', 48.8566, 2.3522);
        $this->creer_evenement_a('Marseille', 43.2965, 5.3698);
        $this->creer_evenement_a('Lyon', 45.7640, 4.8357);

        // La personne se trouve près de Lyon
        $reponse = $this->getJson('/api/evenements?lat=45.75&lng=4.85')->assertOk();

        $this->assertSame(['Lyon', 'Marseille', 'Paris'], collect($reponse->json('data'))->pluck('titre')->all());
    }

    public function test_la_distance_en_kilometres_est_renvoyee(): void
    {
        $this->creer_evenement_a('Lyon', 45.7640, 4.8357);

        $reponse = $this->getJson('/api/evenements?lat=45.75&lng=4.85')->assertOk();

        // Environ 1,9 km entre les deux points
        $this->assertEqualsWithDelta(1.9, $reponse->json('data.0.distance_km'), 0.2);
    }

    public function test_un_evenement_sans_coordonnees_arrive_en_dernier_sans_distance(): void
    {
        $this->creer_evenement_a('Sans carte', null, null);
        $this->creer_evenement_a('Marseille', 43.2965, 5.3698);

        $reponse = $this->getJson('/api/evenements?lat=45.75&lng=4.85')->assertOk();

        $this->assertSame(['Marseille', 'Sans carte'], collect($reponse->json('data'))->pluck('titre')->all());
        $this->assertNull($reponse->json('data.1.distance_km'));
    }

    public function test_sans_position_il_n_y_a_pas_de_distance(): void
    {
        $this->creer_evenement_a('Lyon', 45.7640, 4.8357);

        $this->getJson('/api/evenements')
            ->assertOk()
            ->assertJsonMissingPath('data.0.distance_km');
    }

    public function test_une_position_invalide_est_refusee(): void
    {
        $this->getJson('/api/evenements?lat=abc&lng=4.85')->assertStatus(422)->assertJsonValidationErrors(['lat']);
        $this->getJson('/api/evenements?lat=200&lng=4.85')->assertStatus(422)->assertJsonValidationErrors(['lat']);
    }
}