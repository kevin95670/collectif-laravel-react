<?php

namespace Tests\Feature;

use App\Models\Evenement;
use App\Models\User;
use App\Notifications\PlaceLiberee;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class FavoriTest extends TestCase
{
    use RefreshDatabase;

    // Un événement à 2 places, entièrement pris par deux personnes
    private function creer_evenement_complet(): array
    {
        $evenement = Evenement::factory()->create(['nombre_places_max' => 2]);
        $inscrit_1 = User::factory()->create();
        $inscrit_2 = User::factory()->create();
        $evenement->participants()->attach([$inscrit_1->id, $inscrit_2->id]);

        return [$evenement, $inscrit_1, $inscrit_2];
    }

    public function test_on_peut_mettre_un_evenement_en_favori(): void
    {
        $utilisateur = User::factory()->create();
        $evenement = Evenement::factory()->create();

        $this->actingAs($utilisateur)
            ->postJson("/api/evenements/{$evenement->id}/favori")
            ->assertCreated()
            ->assertJsonPath('est_favori', true);

        $this->assertDatabaseHas('favoris', ['user_id' => $utilisateur->id, 'evenement_id' => $evenement->id]);
    }

    public function test_mettre_deux_fois_en_favori_ne_cree_pas_de_doublon(): void
    {
        $utilisateur = User::factory()->create();
        $evenement = Evenement::factory()->create();

        $this->actingAs($utilisateur);
        $this->postJson("/api/evenements/{$evenement->id}/favori")->assertCreated();
        $this->postJson("/api/evenements/{$evenement->id}/favori")->assertCreated();

        $this->assertDatabaseCount('favoris', 1);
    }

    public function test_on_peut_retirer_un_favori(): void
    {
        $utilisateur = User::factory()->create();
        $evenement = Evenement::factory()->create();
        $utilisateur->evenements_favoris()->attach($evenement->id);

        $this->actingAs($utilisateur)
            ->deleteJson("/api/evenements/{$evenement->id}/favori")
            ->assertOk()
            ->assertJsonPath('est_favori', false);

        $this->assertDatabaseCount('favoris', 0);
    }

    public function test_un_visiteur_ne_peut_pas_gerer_les_favoris(): void
    {
        $evenement = Evenement::factory()->create();

        $this->postJson("/api/evenements/{$evenement->id}/favori")->assertUnauthorized();
        $this->deleteJson("/api/evenements/{$evenement->id}/favori")->assertUnauthorized();
        $this->getJson('/api/mes-favoris')->assertUnauthorized();
    }

    public function test_la_liste_ne_contient_que_mes_favoris_a_venir(): void
    {
        $utilisateur = User::factory()->create();
        $autre = User::factory()->create();

        $a_venir = Evenement::factory()->create();
        $passe = Evenement::factory()->passe()->create();
        $favori_d_un_autre = Evenement::factory()->create();

        $utilisateur->evenements_favoris()->attach([$a_venir->id, $passe->id]);
        $autre->evenements_favoris()->attach($favori_d_un_autre->id);

        $this->actingAs($utilisateur)
            ->getJson('/api/mes-favoris')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $a_venir->id)
            ->assertJsonPath('0.est_favori', true);
    }

    public function test_la_recherche_et_le_detail_indiquent_si_l_evenement_est_en_favori(): void
    {
        $utilisateur = User::factory()->create();
        $evenement = Evenement::factory()->create();
        $utilisateur->evenements_favoris()->attach($evenement->id);

        $this->actingAs($utilisateur);

        $this->getJson('/api/evenements')->assertOk()->assertJsonPath('data.0.est_favori', true);
        $this->getJson("/api/evenements/{$evenement->id}")->assertOk()->assertJsonPath('est_favori', true);
    }

    public function test_un_favori_est_prevenu_quand_une_place_se_libere_sur_un_evenement_complet(): void
    {
        Notification::fake();
        [$evenement, $inscrit_1] = $this->creer_evenement_complet();
        $favori = User::factory()->create();
        $favori->evenements_favoris()->attach($evenement->id);

        $this->actingAs($inscrit_1)->deleteJson("/api/evenements/{$evenement->id}/inscription")->assertOk();

        Notification::assertSentTo($favori, PlaceLiberee::class);
    }

    public function test_personne_n_est_prevenu_si_l_evenement_n_etait_pas_complet(): void
    {
        Notification::fake();
        $evenement = Evenement::factory()->create(['nombre_places_max' => 5]);
        $inscrit = User::factory()->create();
        $evenement->participants()->attach($inscrit->id);
        $favori = User::factory()->create();
        $favori->evenements_favoris()->attach($evenement->id);

        $this->actingAs($inscrit)->deleteJson("/api/evenements/{$evenement->id}/inscription")->assertOk();

        Notification::assertNothingSent();
    }

    public function test_ni_les_inscrits_ni_celui_qui_part_ne_sont_prevenus(): void
    {
        Notification::fake();
        [$evenement, $inscrit_1, $inscrit_2] = $this->creer_evenement_complet();
        // Les deux inscrits ont aussi l'événement en favori
        $inscrit_1->evenements_favoris()->attach($evenement->id);
        $inscrit_2->evenements_favoris()->attach($evenement->id);

        $this->actingAs($inscrit_1)->deleteJson("/api/evenements/{$evenement->id}/inscription")->assertOk();

        Notification::assertNotSentTo($inscrit_1, PlaceLiberee::class);   // il vient de partir
        Notification::assertNotSentTo($inscrit_2, PlaceLiberee::class);   // il a déjà sa place
    }

    public function test_rien_n_est_envoye_pour_un_evenement_annule(): void
    {
        Notification::fake();
        $evenement = Evenement::factory()->annule()->create(['nombre_places_max' => 2]);
        $inscrit_1 = User::factory()->create();
        $inscrit_2 = User::factory()->create();
        $evenement->participants()->attach([$inscrit_1->id, $inscrit_2->id]);
        $favori = User::factory()->create();
        $favori->evenements_favoris()->attach($evenement->id);

        $this->actingAs($inscrit_1)->deleteJson("/api/evenements/{$evenement->id}/inscription")->assertOk();

        Notification::assertNothingSent();
    }

    public function test_augmenter_les_places_d_un_evenement_complet_previent_les_favoris(): void
    {
        Notification::fake();
        [$evenement] = $this->creer_evenement_complet();
        $favori = User::factory()->create();
        $favori->evenements_favoris()->attach($evenement->id);

        $this->actingAs($evenement->organisateur)->putJson("/api/evenements/{$evenement->id}", [
            'titre' => $evenement->titre,
            'description' => $evenement->description,
            'sport' => $evenement->sport,
            'adresse' => $evenement->adresse,
            'ville' => $evenement->ville,
            'date_debut' => $evenement->date_debut->format('Y-m-d H:i:s'),
            'date_fin' => $evenement->date_fin->format('Y-m-d H:i:s'),
            'nombre_places_max' => 4,
        ])->assertOk();

        Notification::assertSentTo($favori, PlaceLiberee::class);
    }
}