<?php

use App\Http\Controllers\AuthentificationController;
use App\Http\Controllers\EvenementController;
use Illuminate\Support\Facades\Route;

Route::post('/inscription', [AuthentificationController::class, 'inscrire']);
Route::post('/connexion', [AuthentificationController::class, 'connecter']);
Route::get('/evenements', [EvenementController::class, 'index']);

// Routes réservées aux personnes connectées
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/deconnexion', [AuthentificationController::class, 'deconnecter']);
    Route::get('/utilisateur', [AuthentificationController::class, 'utilisateur_connecte']);
    Route::post('/evenements', [EvenementController::class, 'creer']);
});