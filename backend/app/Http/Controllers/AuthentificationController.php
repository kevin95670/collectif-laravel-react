<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthentificationController extends Controller
{
    // Crée un compte, puis connecte directement la personne.
    public function inscrire(Request $request): JsonResponse
    {
        // validate() contrôle les données. En cas d'erreur, Laravel arrête tout seul
        // et renvoie une réponse 422 en JSON avec la liste des erreurs par champ.
        $donnees_validees = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'], // unique dans la table users
            'password' => ['required', 'string', 'min:8','confirmed'],
        ]);

        // Le mot de passe est haché automatiquement : le modèle User le déclare
        // avec le cast 'hashed'. Inutile (et dangereux) de le hacher soi-même ici.
        $utilisateur = User::create($donnees_validees);

        // Ouvre la session : Laravel dépose le cookie de session dans la réponse.
        Auth::login($utilisateur);
        $request->session()->regenerate();

        return response()->json($utilisateur, 201); // 201 = "créé"
    }

    // Vérifie l'email et le mot de passe, puis ouvre la session.
    public function connecter(Request $request): JsonResponse
    {
        $identifiants = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        // Auth::attempt compare avec la base (il vérifie le hachage lui-même)
        // et ouvre la session si c'est bon.
        if (! Auth::attempt($identifiants)) {
            // Même format d'erreur que validate() : React gère les deux de la même façon.
            throw ValidationException::withMessages([
                'email' => 'Email ou mot de passe incorrect.',
            ]);
        }

        // Nouvel identifiant de session après la connexion (protection contre la fixation de session).
        $request->session()->regenerate();

        return response()->json(Auth::user());
    }

    // Ferme la session.
    public function deconnecter(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();        // détruit la session
        $request->session()->regenerateToken();   // nouveau jeton CSRF

        return response()->json(['message' => 'Déconnecté']);
    }

    // Renvoie la personne actuellement connectée (React s'en sert au chargement de la page).
    public function utilisateur_connecte(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }
}