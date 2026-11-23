<?php

namespace Tests\Feature;

use App\Models\Evenement;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_visiteur_ne_peut_pas_lire_le_chat(): void
    {
        $evenement = Evenement::factory()->create();

        $this->getJson("/api/evenements/{$evenement->id}/messages")->assertUnauthorized();
    }

    public function test_une_personne_non_inscrite_ne_peut_ni_lire_ni_ecrire(): void
    {
        $evenement = Evenement::factory()->create();
        $inconnu = User::factory()->create();

        $this->actingAs($inconnu)->getJson("/api/evenements/{$evenement->id}/messages")->assertForbidden();
        $this->actingAs($inconnu)->postJson("/api/evenements/{$evenement->id}/messages", ['contenu' => 'Salut'])->assertForbidden();
    }

    public function test_un_participant_peut_ecrire_et_lire(): void
    {
        $evenement = Evenement::factory()->create();
        $participant = User::factory()->create();
        $evenement->participants()->attach($participant);

        $this->actingAs($participant)
            ->postJson("/api/evenements/{$evenement->id}/messages", ['contenu' => 'Salut tout le monde'])
            ->assertCreated();

        $this->actingAs($participant)
            ->getJson("/api/evenements/{$evenement->id}/messages")
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.contenu', 'Salut tout le monde');
    }

    public function test_l_organisateur_peut_ecrire(): void
    {
        $evenement = Evenement::factory()->create();

        $this->actingAs($evenement->organisateur)
            ->postJson("/api/evenements/{$evenement->id}/messages", ['contenu' => 'Rendez-vous à 18 h'])
            ->assertCreated();
    }

    public function test_on_ne_peut_plus_ecrire_sur_un_evenement_annule(): void
    {
        $evenement = Evenement::factory()->annule()->create();

        $this->actingAs($evenement->organisateur)
            ->postJson("/api/evenements/{$evenement->id}/messages", ['contenu' => 'Trop tard'])
            ->assertForbidden();
    }

    public function test_on_ne_peut_pas_citer_un_message_d_un_autre_evenement(): void
    {
        $evenement = Evenement::factory()->create();
        $autre_evenement = Evenement::factory()->create();
        $message_ailleurs = Message::create([
            'evenement_id' => $autre_evenement->id,
            'auteur_id' => $autre_evenement->organisateur_id,
            'contenu' => 'Un message secret',
        ]);

        $this->actingAs($evenement->organisateur)
            ->postJson("/api/evenements/{$evenement->id}/messages", [
                'contenu' => 'Je cite',
                'reponse_a_id' => $message_ailleurs->id,
            ])
            ->assertJsonValidationErrors(['reponse_a_id']);
    }

    public function test_les_messages_sont_regroupes_dans_une_seule_notification(): void
    {
        $evenement = Evenement::factory()->create();
        $organisateur = $evenement->organisateur;
        $participant = User::factory()->create();
        $evenement->participants()->attach($participant);

        // Le participant écrit deux fois : l'organisateur doit avoir UNE notification "2 nouveaux messages"
        $this->actingAs($participant)->postJson("/api/evenements/{$evenement->id}/messages", ['contenu' => 'Un'])->assertCreated();
        $this->actingAs($participant)->postJson("/api/evenements/{$evenement->id}/messages", ['contenu' => 'Deux'])->assertCreated();

        $this->assertSame(1, $organisateur->unreadNotifications()->count());
        $this->assertSame(2, $organisateur->unreadNotifications()->first()->data['nombre_messages']);

        // L'auteur ne se notifie pas lui-même
        $this->assertSame(0, $participant->unreadNotifications()->count());
    }
}