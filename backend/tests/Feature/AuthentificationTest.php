<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthentificationTest extends TestCase
{
    use RefreshDatabase;   // la base est remise à zéro avant chaque test

    public function test_on_peut_creer_un_compte_et_on_est_connecte(): void
    {
        $reponse = $this->postJson('/api/inscription', [
            'name' => 'Camille',
            'email' => 'camille@exemple.fr',
            'password' => 'motdepasse1',
            'password_confirmation' => 'motdepasse1',
        ]);

        $reponse->assertCreated();
        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', ['email' => 'camille@exemple.fr']);
    }

    public function test_deux_mots_de_passe_differents_sont_refuses(): void
    {
        $this->postJson('/api/inscription', [
            'name' => 'Camille',
            'email' => 'camille@exemple.fr',
            'password' => 'motdepasse1',
            'password_confirmation' => 'autrechose12',
        ])->assertJsonValidationErrors(['password']);

        $this->assertDatabaseMissing('users', ['email' => 'camille@exemple.fr']);
    }

    public function test_une_adresse_deja_utilisee_est_refusee(): void
    {
        User::factory()->create(['email' => 'camille@exemple.fr']);

        $this->postJson('/api/inscription', [
            'name' => 'Autre',
            'email' => 'camille@exemple.fr',
            'password' => 'motdepasse1',
            'password_confirmation' => 'motdepasse1',
        ])->assertJsonValidationErrors(['email']);
    }

    public function test_on_peut_se_connecter(): void
    {
        // Le mot de passe de la fabrique d'utilisateurs est "password"
        $utilisateur = User::factory()->create(['email' => 'camille@exemple.fr']);

        $this->postJson('/api/connexion', ['email' => 'camille@exemple.fr', 'password' => 'password'])
            ->assertOk();

        $this->assertAuthenticatedAs($utilisateur);
    }

    public function test_un_mauvais_mot_de_passe_est_refuse(): void
    {
        User::factory()->create(['email' => 'camille@exemple.fr']);

        $this->postJson('/api/connexion', ['email' => 'camille@exemple.fr', 'password' => 'mauvais'])
            ->assertJsonValidationErrors(['email']);

        $this->assertGuest();
    }

    public function test_un_visiteur_ne_peut_pas_lire_son_profil(): void
    {
        $this->getJson('/api/utilisateur')->assertUnauthorized();
    }
}