<?php

use App\Http\Controllers\AuthentificationController;
use App\Http\Controllers\EvenementController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ProfilController;
use App\Http\Controllers\MotDePasseOublieController;
use App\Http\Controllers\OrganisateurController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\FavoriController;
use App\Http\Controllers\AvisController;

// ----- Routes publiques -----
Route::post('/inscription', [AuthentificationController::class, 'inscrire']);
Route::post('/connexion', [AuthentificationController::class, 'connecter']);
// Mot de passe oublié. throttle:5,1 : 5 essais par minute maximum (contre les abus)
Route::post('/mot-de-passe-oublie', [MotDePasseOublieController::class, 'envoyer_lien'])->middleware('throttle:5,1');
Route::post('/reinitialisation-mot-de-passe', [MotDePasseOublieController::class, 'reinitialiser'])->middleware('throttle:5,1');

Route::get('/evenements', [EvenementController::class, 'index']);
Route::get('/sports', [EvenementController::class, 'compter_evenements_par_sport']);
Route::get('/organisateurs/{organisateur}', [OrganisateurController::class, 'afficher']);
Route::get('/evenements/{evenement}', [EvenementController::class, 'afficher']);
Route::get('/organisateurs/{organisateur}/avis', [AvisController::class, 'lister']);

// ----- Routes réservées aux personnes connectées -----
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/deconnexion', [AuthentificationController::class, 'deconnecter']);
    Route::get('/utilisateur', [AuthentificationController::class, 'utilisateur_connecte']);

    // Profil
    Route::put('/profil', [ProfilController::class, 'modifier_informations']);
    Route::put('/profil/mot-de-passe', [ProfilController::class, 'modifier_mot_de_passe']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'lister']);
    Route::post('/notifications/tout-lire', [NotificationController::class, 'tout_marquer_comme_lu']);
    Route::post('/notifications/{identifiant}/lue', [NotificationController::class, 'marquer_comme_lue']);

    // Événements
    Route::post('/evenements', [EvenementController::class, 'creer']);
    Route::put('/evenements/{evenement}', [EvenementController::class, 'modifier']);
    Route::post('/evenements/{evenement}/annulation', [EvenementController::class, 'annuler']);
    Route::get('/mes-evenements', [EvenementController::class, 'mes_evenements']);

    // Inscriptions
    Route::post('/evenements/{evenement}/inscription', [EvenementController::class, 'rejoindre']);
    Route::delete('/evenements/{evenement}/inscription', [EvenementController::class, 'quitter']);

    // Photo
    Route::post('/evenements/{evenement}/photo', [EvenementController::class, 'televerser_photo']);
    Route::delete('/evenements/{evenement}/photo', [EvenementController::class, 'supprimer_photo']);

    // Chat
    Route::get('/evenements/{evenement}/messages', [MessageController::class, 'lister']);
    Route::post('/evenements/{evenement}/messages', [MessageController::class, 'envoyer']);

    // Favoris
    Route::get('/mes-favoris', [FavoriController::class, 'lister']);
    Route::post('/evenements/{evenement}/favori', [FavoriController::class, 'ajouter']);
    Route::delete('/evenements/{evenement}/favori', [FavoriController::class, 'retirer']);

    //Avis
    Route::post('/evenements/{evenement}/avis', [AvisController::class, 'creer']);
});