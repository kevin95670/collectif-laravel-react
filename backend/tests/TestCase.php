<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Http;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    // Mettre false dans un test qui veut simuler lui-même l'API d'adresses
    protected bool $simulerGeocodage = true;

    // Appelée juste après la création de l'application, AVANT que la base soit vidée.
    // Garde-fou : on refuse de continuer si la base n'est pas la base de test.
    protected function refreshApplication(): void
    {
        // On impose la base de test AVANT de démarrer Laravel.
        // On écrit à tous les endroits où Laravel peut lire une variable (getenv, $_ENV, $_SERVER),
        // pour écraser celles que Docker a déjà définies (DB_CONNECTION=mysql...).
        $reglages_de_test = [
            'APP_ENV' => 'testing',
            'DB_CONNECTION' => 'sqlite',
            'DB_DATABASE' => ':memory:',
            'CACHE_STORE' => 'array',
            'MAIL_MAILER' => 'array',
            'QUEUE_CONNECTION' => 'sync',
            'SESSION_DRIVER' => 'array',
        ];

        foreach ($reglages_de_test as $nom => $valeur) {
            putenv("$nom=$valeur");
            $_ENV[$nom] = $valeur;
            $_SERVER[$nom] = $valeur;
        }

        parent::refreshApplication();

        // Garde-fou : on refuse de continuer si la base n'est pas la base de test.
        if (config('database.default') !== 'sqlite') {
            throw new RuntimeException(
                'Tests refusés : la base utilisée est "' . config('database.default') . '" au lieu de sqlite. Vérifie phpunit.xml.'
            );
        }
    }

    protected function setUp(): void
    {
        parent::setUp();

        if ($this->simulerGeocodage) {
            // Aucun appel réseau réel pendant les tests : l'API d'adresses répond toujours "Lyon"
            Http::fake([
                'api-adresse.data.gouv.fr/*' => Http::response([
                    'features' => [[
                        'geometry' => ['coordinates' => [4.8357, 45.7640]],   // [longitude, latitude]
                        'properties' => ['score' => 0.9],
                    ]],
                ]),
            ]);
        }

        // Les requêtes de test se font passer pour le site React : Laravel active alors la session
        // et les cookies, comme dans le vrai fonctionnement (Sanctum "stateful")
        $this->withHeader('Origin', config('app.frontend_url'));
    }
}