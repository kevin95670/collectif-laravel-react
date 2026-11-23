<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class MotDePasseOublieTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_lien_est_envoye_a_une_adresse_connue(): void
    {
        Notification::fake();
        $utilisateur = User::factory()->create();

        $this->postJson('/api/mot-de-passe-oublie', ['email' => $utilisateur->email])->assertOk();

        Notification::assertSentTo($utilisateur, ResetPassword::class);
    }

    public function test_la_reponse_est_la_meme_pour_une_adresse_inconnue_mais_rien_n_est_envoye(): void
    {
        Notification::fake();

        // Même réponse que pour une adresse connue : on ne révèle pas quels comptes existent
        $this->postJson('/api/mot-de-passe-oublie', ['email' => 'personne@exemple.fr'])->assertOk();

        Notification::assertNothingSent();
    }

    public function test_on_peut_choisir_un_nouveau_mot_de_passe_avec_un_jeton_valide(): void
    {
        $utilisateur = User::factory()->create();
        // createToken : fabrique un jeton valide, comme celui de l'e-mail
        $jeton = Password::createToken($utilisateur);

        $this->postJson('/api/reinitialisation-mot-de-passe', [
            'token' => $jeton,
            'email' => $utilisateur->email,
            'password' => 'nouveaumotdepasse',
            'password_confirmation' => 'nouveaumotdepasse',
        ])->assertOk();

        $this->assertTrue(Hash::check('nouveaumotdepasse', $utilisateur->fresh()->password));
    }

    public function test_un_jeton_invalide_est_refuse(): void
    {
        $utilisateur = User::factory()->create();

        $this->postJson('/api/reinitialisation-mot-de-passe', [
            'token' => 'jeton-bidon',
            'email' => $utilisateur->email,
            'password' => 'nouveaumotdepasse',
            'password_confirmation' => 'nouveaumotdepasse',
        ])->assertJsonValidationErrors(['email']);

        $this->assertFalse(Hash::check('nouveaumotdepasse', $utilisateur->fresh()->password));
    }
}