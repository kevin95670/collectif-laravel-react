<?php

use Illuminate\Support\Facades\Route;

// Toute adresse qui ne correspond à aucune autre route est une page du site React
// (/evenements, /profil, /sports/football...). On renvoie le fichier du site :
// React Router lit l'adresse dans le navigateur et affiche la bonne page.
Route::fallback(function () {
    // app.html est le fichier "index.html" du site React construit pour la production
    $fichier_du_site = public_path('app.html');

    // Les adresses /api/... inconnues restent de vraies erreurs 404, pas une page HTML.
    // En développement, le fichier n'existe pas : on renvoie aussi 404.
    if (request()->is('api/*') || ! file_exists($fichier_du_site)) {
        abort(404);
    }

    // no-cache : après une mise à jour, les visiteurs reçoivent tout de suite la nouvelle version
    return response()->file($fichier_du_site, [
        'Content-Type' => 'text/html; charset=UTF-8',
        'Cache-Control' => 'no-cache',
    ]);
});