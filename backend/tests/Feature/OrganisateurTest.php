<?php

namespace Tests\Feature;

use App\Models\Evenement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganisateurTest extends TestCase
{
    use RefreshDatabase;

    public function test_une_personne_qui_n_a_jamais_organise_n_a_pas_de_page(): void
    {
        $utilisateur = User::factory()->create();

        $this->getJson("/api/organisateurs/{$utilisateur->id}")->assertNotFound();
    }

    public function test_la_page_publique_n_expose_pas_l_adresse_e_mail(): void
    {
        $organisateur = User::factory()->create(['name' => 'Kevin']);
        Evenement::factory()->create(['organisateur_id' => $organisateur->id]);

        $this->getJson("/api/organisateurs/{$organisateur->id}")
            ->assertOk()
            ->assertJsonPath('name', 'Kevin')
            ->assertJsonCount(1, 'evenements_a_venir')
            ->assertJsonMissingPath('email');   // ce champ ne doit JAMAIS apparaître
    }
}