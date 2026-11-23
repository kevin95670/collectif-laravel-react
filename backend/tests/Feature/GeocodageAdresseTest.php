<?php

namespace Tests\Feature;

use App\Services\GeocodageAdresse;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GeocodageAdresseTest extends TestCase
{
    // Ici on simule nous-mêmes l'API : on désactive la simulation commune
    protected bool $simulerGeocodage = false;

    private function reponse_api(float $score): array
    {
        return ['features' => [[
            'geometry' => ['coordinates' => [2.3522, 48.8566]],   // GeoJSON : [longitude, latitude]
            'properties' => ['score' => $score],
        ]]];
    }

    public function test_une_adresse_trouvee_donne_ses_coordonnees(): void
    {
        Http::fake(['api-adresse.data.gouv.fr/*' => Http::response($this->reponse_api(0.9))]);

        $coordonnees = (new GeocodageAdresse())->trouver_coordonnees('10 rue de Rivoli', 'Paris');

        $this->assertSame(['latitude' => 48.8566, 'longitude' => 2.3522], $coordonnees);
    }

    public function test_un_resultat_peu_fiable_est_ignore(): void
    {
        Http::fake(['api-adresse.data.gouv.fr/*' => Http::response($this->reponse_api(0.2))]);

        $this->assertNull((new GeocodageAdresse())->trouver_coordonnees('zzzz', 'qqqq'));
    }

    public function test_aucun_resultat_donne_null(): void
    {
        Http::fake(['api-adresse.data.gouv.fr/*' => Http::response(['features' => []])]);

        $this->assertNull((new GeocodageAdresse())->trouver_coordonnees('zzzz', 'qqqq'));
    }

    public function test_une_panne_reseau_ne_provoque_pas_d_erreur(): void
    {
        Http::fake(function () {
            throw new ConnectionException('Réseau coupé');
        });

        $this->assertNull((new GeocodageAdresse())->trouver_coordonnees('10 rue de Rivoli', 'Paris'));
    }
}