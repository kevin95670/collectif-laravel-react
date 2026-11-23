<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Le lien de l'e-mail de réinitialisation : par défaut il vise Laravel,
        // nous voulons la page React, avec le jeton et l'e-mail dans l'adresse.
        ResetPassword::createUrlUsing(function (object $utilisateur, string $jeton) {
            return config('app.frontend_url')
                . '/reinitialisation-mot-de-passe?token=' . $jeton
                . '&email=' . urlencode($utilisateur->getEmailForPasswordReset());   // urlencode : "@" devient "%40"
        });
    }
}
