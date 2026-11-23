<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class MotDePasseOublieController extends Controller
{
    // POST /api/mot-de-passe-oublie : envoie l'e-mail avec le lien
    public function envoyer_lien(Request $requete): JsonResponse
    {
        $donnees_validees = $requete->validate(['email' => ['required', 'email']]);

        // sendResetLink : crée le jeton, l'enregistre, envoie l'e-mail. Elle renvoie un statut (texte),
        // que l'on ignore volontairement : la réponse est la même que l'adresse existe ou non.
        Password::sendResetLink($donnees_validees);

        return response()->json([
            'message' => "Si cette adresse correspond à un compte, un e-mail avec un lien vient d'être envoyé.",
        ]);
    }

    // POST /api/reinitialisation-mot-de-passe : enregistre le nouveau mot de passe
    public function reinitialiser(Request $requete): JsonResponse
    {
        $requete->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        // Password::reset vérifie le jeton et l'e-mail, puis exécute la fonction ci-dessous si tout est bon.
        // On lui passe les 4 valeurs avec only() (il lit aussi password_confirmation).
        $statut = Password::reset(
            $requete->only('email', 'password', 'password_confirmation', 'token'),
            function (User $utilisateur, string $nouveau_mot_de_passe) {
                // forceFill : écrit sans passer par $fillable. Le cast 'hashed' du modèle hache le mot de passe.
                // remember_token : on le change pour déconnecter les appareils restés connectés.
                $utilisateur->forceFill([
                    'password' => $nouveau_mot_de_passe,
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($utilisateur));
            }
        );

        if ($statut !== Password::PASSWORD_RESET) {
            // Jeton invalide ou expiré : $statut est une clé comme "passwords.token", traduite en français
            // grâce aux fichiers de l'étape 50. Même format d'erreur que validate().
            throw ValidationException::withMessages(['email' => __($statut)]);
        }

        return response()->json(['message' => 'Mot de passe modifié. Tu peux te connecter.']);
    }
}