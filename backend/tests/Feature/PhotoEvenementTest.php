<?php

namespace Tests\Feature;

use App\Models\Evenement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PhotoEvenementTest extends TestCase
{
    use RefreshDatabase;

    // Un vrai fichier PNG d'un pixel (le contrôleur vérifie le contenu, pas seulement l'extension)
    private function fausse_image(string $nom = 'photo.png'): UploadedFile
    {
        $contenu_png = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
        );

        return UploadedFile::fake()->createWithContent($nom, $contenu_png);
    }

    // Envoie la photo en "multipart" (un formulaire avec fichier) et demande une réponse JSON
    private function envoyer_photo(Evenement $evenement, UploadedFile $fichier)
    {
        return $this->post("/api/evenements/{$evenement->id}/photo", ['photo' => $fichier], ['Accept' => 'application/json']);
    }

    public function test_l_organisateur_peut_envoyer_une_photo(): void
    {
        Storage::fake('public');   // un dossier temporaire à la place du vrai disque
        $evenement = Evenement::factory()->create();

        $this->actingAs($evenement->organisateur);
        $reponse = $this->envoyer_photo($evenement, $this->fausse_image());

        $reponse->assertOk();
        // Le chemin est bien noté dans la base : c'est ce que le défaut de $fillable empêchait en ligne
        $chemin = $evenement->fresh()->photo_chemin;
        $this->assertNotNull($chemin);
        Storage::disk('public')->assertExists($chemin);
        $this->assertNotNull($reponse->json('photo_url'));
    }

    public function test_une_nouvelle_photo_remplace_l_ancienne(): void
    {
        Storage::fake('public');
        $evenement = Evenement::factory()->create();
        $this->actingAs($evenement->organisateur);

        $this->envoyer_photo($evenement, $this->fausse_image('premiere.png'))->assertOk();
        $ancien_chemin = $evenement->fresh()->photo_chemin;

        $this->envoyer_photo($evenement, $this->fausse_image('seconde.png'))->assertOk();
        $nouveau_chemin = $evenement->fresh()->photo_chemin;

        $this->assertNotSame($ancien_chemin, $nouveau_chemin);
        Storage::disk('public')->assertMissing($ancien_chemin);   // pas de fichier orphelin
        Storage::disk('public')->assertExists($nouveau_chemin);
    }

    public function test_un_autre_utilisateur_ne_peut_pas_envoyer_de_photo(): void
    {
        Storage::fake('public');
        $evenement = Evenement::factory()->create();

        $this->actingAs(User::factory()->create());
        $this->envoyer_photo($evenement, $this->fausse_image())->assertForbidden();

        $this->assertNull($evenement->fresh()->photo_chemin);
        $this->assertEmpty(Storage::disk('public')->allFiles());   // rien n'a été écrit
    }

    public function test_un_visiteur_ne_peut_pas_envoyer_de_photo(): void
    {
        Storage::fake('public');
        $evenement = Evenement::factory()->create();

        $this->envoyer_photo($evenement, $this->fausse_image())->assertUnauthorized();
    }

    public function test_un_fichier_qui_n_est_pas_une_image_est_refuse(): void
    {
        Storage::fake('public');
        $evenement = Evenement::factory()->create();
        $this->actingAs($evenement->organisateur);

        $faux_document = UploadedFile::fake()->create('document.pdf', 10, 'application/pdf');

        $this->envoyer_photo($evenement, $faux_document)->assertJsonValidationErrors(['photo']);
        $this->assertNull($evenement->fresh()->photo_chemin);
    }

    public function test_l_organisateur_peut_supprimer_la_photo(): void
    {
        Storage::fake('public');
        $evenement = Evenement::factory()->create();
        $this->actingAs($evenement->organisateur);

        $this->envoyer_photo($evenement, $this->fausse_image())->assertOk();
        $chemin = $evenement->fresh()->photo_chemin;

        $this->deleteJson("/api/evenements/{$evenement->id}/photo")->assertOk();

        $this->assertNull($evenement->fresh()->photo_chemin);
        Storage::disk('public')->assertMissing($chemin);
    }
}