<?php

namespace Tests\Feature;

use App\Models\Evenement;
use App\Models\User;
use App\Notifications\EvenementAnnule;
use App\Notifications\EvenementModifie;
use App\Notifications\NouveauParticipant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class EvenementTest extends TestCase
{
    use RefreshDatabase;

    // Des données valides pour le formulaire ; "remplacements" change un champ pour provoquer une erreur
    private function donnees_valides(array $remplacements = []): array
    {
        return array_merge([
            'titre' => 'Foot du jeudi',
            'sport' => 'football',
            'description' => "On joue et on s'attend.",
            'adresse' => '10 rue de Rivoli',
            'ville' => 'Paris',
            'date_debut' => now()->addDays(3)->format('Y-m-d\TH:i'),
            'date_fin' => now()->addDays(3)->addHours(2)->format('Y-m-d\TH:i'),
            'nombre_places_max' => 10,
        ], $remplacements);
    }

    // --- Création ---

    public function test_un_visiteur_ne_peut_pas_creer_un_evenement(): void
    {
        $this->postJson('/api/evenements', $this->donnees_valides())->assertUnauthorized();
    }

    public function test_un_utilisateur_connecte_peut_creer_un_evenement(): void
    {
        $organisateur = User::factory()->create();

        // actingAs : on se comporte comme cette personne connectée
        $this->actingAs($organisateur)
            ->postJson('/api/evenements', $this->donnees_valides())
            ->assertSuccessful();

        $this->assertDatabaseHas('evenements', ['titre' => 'Foot du jeudi', 'organisateur_id' => $organisateur->id]);
        // Les coordonnées ont été calculées par l'écouteur "saving" (avec l'API simulée)
        $this->assertNotNull(Evenement::first()->latitude);
    }

    public function test_une_date_de_debut_dans_le_passe_est_refusee(): void
    {
        $this->actingAs(User::factory()->create())
            ->postJson('/api/evenements', $this->donnees_valides(['date_debut' => now()->subDay()->format('Y-m-d\TH:i')]))
            ->assertJsonValidationErrors(['date_debut']);
    }

    // --- Liste ---

    public function test_la_liste_ne_montre_que_les_evenements_a_venir_et_non_annules(): void
    {
        Evenement::factory()->create();
        Evenement::factory()->passe()->create();
        Evenement::factory()->annule()->create();

        $this->getJson('/api/evenements')->assertOk()->assertJsonCount(1);
    }

    public function test_on_peut_filtrer_la_liste_par_sport(): void
    {
        Evenement::factory()->create(['sport' => 'football']);
        Evenement::factory()->create(['sport' => 'running']);

        $this->getJson('/api/evenements?sport=running')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.sport', 'running');
    }

    // --- Inscriptions ---

    public function test_on_peut_rejoindre_un_evenement_et_l_organisateur_est_prevenu(): void
    {
        Notification::fake();   // aucune vraie notification : on vérifie seulement qu'elle est "envoyée"
        $evenement = Evenement::factory()->create();
        $participant = User::factory()->create();

        $this->actingAs($participant)
            ->postJson("/api/evenements/{$evenement->id}/inscription")
            ->assertSuccessful();

        $this->assertTrue($evenement->participants()->where('users.id', $participant->id)->exists());
        Notification::assertSentTo($evenement->organisateur, NouveauParticipant::class);
    }

    public function test_un_evenement_complet_refuse_une_nouvelle_inscription(): void
    {
        $evenement = Evenement::factory()->create(['nombre_places_max' => 1]);
        $evenement->participants()->attach(User::factory()->create());

        $reponse = $this->actingAs(User::factory()->create())
            ->postJson("/api/evenements/{$evenement->id}/inscription");

        $this->assertFalse($reponse->isSuccessful());
        $this->assertSame(1, $evenement->participants()->count());
    }

    public function test_on_peut_quitter_un_evenement(): void
    {
        $evenement = Evenement::factory()->create();
        $participant = User::factory()->create();
        $evenement->participants()->attach($participant);

        $this->actingAs($participant)
            ->deleteJson("/api/evenements/{$evenement->id}/inscription")
            ->assertSuccessful();

        $this->assertSame(0, $evenement->participants()->count());
    }

    // --- Modification et annulation ---

    public function test_seul_l_organisateur_peut_modifier(): void
    {
        $evenement = Evenement::factory()->create();

        $this->actingAs(User::factory()->create())
            ->putJson("/api/evenements/{$evenement->id}", $this->donnees_valides())
            ->assertForbidden();
    }

    public function test_l_organisateur_modifie_et_les_participants_sont_prevenus(): void
    {
        Notification::fake();
        $evenement = Evenement::factory()->create();
        $participant = User::factory()->create();
        $evenement->participants()->attach($participant);

        $this->actingAs($evenement->organisateur)
            ->putJson("/api/evenements/{$evenement->id}", $this->donnees_valides(['titre' => 'Nouveau titre']))
            ->assertSuccessful();

        $this->assertDatabaseHas('evenements', ['id' => $evenement->id, 'titre' => 'Nouveau titre']);
        Notification::assertSentTo($participant, EvenementModifie::class);
    }

    public function test_l_organisateur_annule_et_les_participants_sont_prevenus(): void
    {
        Notification::fake();
        $evenement = Evenement::factory()->create();
        $participant = User::factory()->create();
        $evenement->participants()->attach($participant);

        $this->actingAs($evenement->organisateur)
            ->postJson("/api/evenements/{$evenement->id}/annulation")
            ->assertSuccessful();

        $this->assertTrue($evenement->fresh()->est_annule);
        Notification::assertSentTo($participant, EvenementAnnule::class);
    }

    public function test_un_autre_utilisateur_ne_peut_pas_annuler(): void
    {
        $evenement = Evenement::factory()->create();

        $this->actingAs(User::factory()->create())
            ->postJson("/api/evenements/{$evenement->id}/annulation")
            ->assertForbidden();

        $this->assertFalse($evenement->fresh()->est_annule);
    }
}