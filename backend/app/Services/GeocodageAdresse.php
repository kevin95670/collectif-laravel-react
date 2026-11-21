<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Throwable;

// Transforme une adresse écrite en coordonnées GPS grâce à l'API officielle française.
class GeocodageAdresse
{
    // Renvoie ['latitude' => ..., 'longitude' => ...], ou null si l'adresse n'a pas été trouvée
    public function trouver_coordonnees(string $adresse, string $ville): ?array
    {
        try {
            // Http : le client HTTP de Laravel. timeout(4) : on n'attend pas plus de 4 secondes,
            // pour ne pas bloquer la création d'un événement si l'API est lente.
            $reponse = Http::timeout(4)->get('https://api-adresse.data.gouv.fr/search/', [
                'q' => $adresse . ' ' . $ville,
                'limit' => 1,   // on ne garde que le meilleur résultat
            ]);
        } catch (Throwable $erreur) {
            // Pas d'internet, API en panne, délai dépassé... : l'événement se crée quand même
            return null;
        }

        if ($reponse->failed()) {
            return null;
        }

        // L'API répond en GeoJSON : { features: [ { geometry: { coordinates: [longitude, latitude] }, properties: { score } } ] }
        // json('features.0') va chercher le premier résultat (null s'il n'y en a aucun).
        $resultat = $reponse->json('features.0');

        // "score" : la confiance de l'API entre 0 et 1. En dessous de 0.4, on préfère ne rien afficher
        // plutôt qu'un marqueur au mauvais endroit.
        if ($resultat === null || ($resultat['properties']['score'] ?? 0) < 0.4) {
            return null;
        }

        // Attention : GeoJSON donne la LONGITUDE en premier, puis la latitude
        [$longitude, $latitude] = $resultat['geometry']['coordinates'];

        return ['latitude' => $latitude, 'longitude' => $longitude];
    }
}