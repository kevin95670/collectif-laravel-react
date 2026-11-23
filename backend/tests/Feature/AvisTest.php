<?php

namespace Tests\Feature;

use App\Models\Avis;
use App\Models\Evenement;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AvisTest extends TestCase
{
    use RefreshDatabase;

    // Un événement terminé depuis 3 jours
    private function creer_evenement_termine(): Evenement
    {
        return Evenement::factory()->create([
            'date_debut' => now()->subDays(3),
            'date_fin' => now()->subDays(3)->addHours(2),
        ]);
    }

    private function inscrire_une_personne(Evenement $evenement): User
    {
        $utilisateur = User::factory()->create();
        $evenement->participants()->attach($utilisateur->id);

        return $utilisateur;
    }

    private function envoyer_un_avis(Evenement $evenement, array $donnees = ['note' => 5, 'commentaire' => 'Très bien.'])
    {
        return $this->postJson("/api/evenements/{$evenement->id}/avis", $donnees);
    }

    public function test_une_personne_inscrite_peut_donner_un_avis_apres_la_fin(): void
    {
        $evenement = $this->creer_evenement_termine();
        $inscrit = $this->inscrire_une_personne($evenement);

        $this->actingAs($inscrit);
        $this->envoyer_un_avis($evenement)->assertCreated()->assertJsonPath('note', 5);

        $this->assertDatabaseHas('avis', ['evenement_id' => $evenement->id, 'auteur_id' => $inscrit->id, 'note' => 5]);
    }

    public function test_on_ne_peut_pas_donner_d_avis_avant_la_fin(): void
    {
        $evenement = Evenement::factory()->create();   // à venir
        $inscrit = $this->inscrire_une_personne($evenement);

        $this->actingAs($inscrit);
        $this->envoyer_un_avis($evenement)->assertForbidden();
    }

    public function test_une_personne_non_inscrite_ne_peut_pas_donner_d_avis(): void
    {
        $evenement = $this->creer_evenement_termine();

        $this->actingAs(User::factory()->create());
        $this->envoyer_un_avis($evenement)->assertForbidden();
    }

    public function test_l_organisateur_ne_peut_pas_se_noter_lui_meme(): void
    {
        $evenement = $this->creer_evenement_termine();
        $evenement->participants()->attach($evenement->organisateur_id);

        $this->actingAs($evenement->organisateur);
        $this->envoyer_un_avis($evenement)->assertForbidden();
    }

    public function test_un_seul_avis_par_personne_et_par_evenement(): void
    {
        $evenement = $this->creer_evenement_termine();
        $inscrit = $this->inscrire_une_personne($evenement);

        $this->actingAs($inscrit);
        $this->envoyer_un_avis($evenement)->assertCreated();
        $this->envoyer_un_avis($evenement)->assertForbidden();

        $this->assertDatabaseCount('avis', 1);
    }

    public function test_on_ne_peut_pas_noter_un_evenement_annule(): void
    {
        $evenement = Evenement::factory()->annule()->create([
            'date_debut' => now()->subDays(3),
            'date_fin' => now()->subDays(3)->addHours(2),
        ]);
        $inscrit = $this->inscrire_une_personne($evenement);

        $this->actingAs($inscrit);
        $this->envoyer_un_avis($evenement)->assertForbidden();
    }

    public function test_la_note_doit_etre_comprise_entre_1_et_5(): void
    {
        $evenement = $this->creer_evenement_termine();
        $inscrit = $this->inscrire_une_personne($evenement);

        $this->actingAs($inscrit);
        $this->envoyer_un_avis($evenement, ['note' => 6])->assertJsonValidationErrors(['note']);
        $this->envoyer_un_avis($evenement, ['note' => 0])->assertJsonValidationErrors(['note']);
        $this->envoyer_un_avis($evenement, ['commentaire' => 'Sans note'])->assertJsonValidationErrors(['note']);
    }

    public function test_un_visiteur_ne_peut_pas_donner_d_avis(): void
    {
        $evenement = $this->creer_evenement_termine();

        $this->envoyer_un_avis($evenement)->assertUnauthorized();
    }

    public function test_la_page_de_l_organisateur_donne_la_moyenne_et_les_avis_sans_adresse_email(): void
    {
        $evenement = $this->creer_evenement_termine();
        $premier = $this->inscrire_une_personne($evenement);
        $second = $this->inscrire_une_personne($evenement);
        Avis::create(['evenement_id' => $evenement->id, 'auteur_id' => $premier->id, 'note' => 5, 'commentaire' => 'Génial']);
        Avis::create(['evenement_id' => $evenement->id, 'auteur_id' => $second->id, 'note' => 4, 'commentaire' => null]);

        $reponse = $this->getJson("/api/organisateurs/{$evenement->organisateur_id}/avis")
            ->assertOk()
            ->assertJsonPath('nombre', 2)
            ->assertJsonPath('moyenne', 4.5)
            ->assertJsonCount(2, 'avis')
            ->assertJsonPath('avis.0.auteur', $second->name);   // le plus récent d'abord

        $this->assertStringNotContainsString('@', $reponse->getContent());   // aucune adresse e-mail
    }

    public function test_un_organisateur_sans_avis_n_a_pas_de_moyenne(): void
    {
        $evenement = $this->creer_evenement_termine();

        $this->getJson("/api/organisateurs/{$evenement->organisateur_id}/avis")
            ->assertOk()
            ->assertJsonPath('nombre', 0)
            ->assertJsonPath('moyenne', null)
            ->assertJsonCount(0, 'avis');
    }

    public function test_le_detail_indique_si_on_peut_donner_un_avis(): void
    {
        $evenement = $this->creer_evenement_termine();
        $inscrit = $this->inscrire_une_personne($evenement);

        $this->actingAs($inscrit);

        $this->getJson("/api/evenements/{$evenement->id}")
            ->assertJsonPath('peut_donner_un_avis', true)
            ->assertJsonPath('mon_avis', null);

        $this->envoyer_un_avis($evenement, ['note' => 4, 'commentaire' => 'Bien'])->assertCreated();

        $this->getJson("/api/evenements/{$evenement->id}")
            ->assertJsonPath('peut_donner_un_avis', false)
            ->assertJsonPath('mon_avis.note', 4);
    }
}