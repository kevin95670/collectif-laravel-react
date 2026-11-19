<?php

use App\Http\Controllers\AuthentificationController;
use App\Http\Controllers\EvenementController;
use Illuminate\Support\Facades\Route;

Route::post('/inscription', [AuthentificationController::class, 'inscrire']);
Route::post('/connexion', [AuthentificationController::class, 'connecter']);
Route::get('/evenements', [EvenementController::class, 'index']);
// Publique (juste après la route GET /evenements) :
Route::get('/evenements/{evenement}', [EvenementController::class, 'afficher']);

// Routes réservées aux personnes connectées
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/deconnexion', [AuthentificationController::class, 'deconnecter']);
    Route::get('/utilisateur', [AuthentificationController::class, 'utilisateur_connecte']);
    Route::get('/mes-evenements', [EvenementController::class, 'mes_evenements']);
    Route::post('/evenements', [EvenementController::class, 'creer']);
    Route::put('/evenements/{evenement}', [EvenementController::class, 'modifier']);
    Route::post('/evenements/{evenement}/annulation', [EvenementController::class, 'annuler']);
    Route::post('/evenements/{evenement}/inscription', [EvenementController::class, 'rejoindre']);
    Route::delete('/evenements/{evenement}/inscription', [EvenementController::class, 'quitter']);
});