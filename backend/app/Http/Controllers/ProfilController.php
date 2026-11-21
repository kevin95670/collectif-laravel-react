<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProfilController extends Controller
{
    // PUT /api/profil : modifier son nom et son e-mail
    public function modifier_informations(Request $requete): JsonResponse
    {
        $utilisateur = $requete->user();

        $donnees_validees = $requete->validate([
            'name' => 'required|string|max:255',
            // Rule::unique refuse un e-mail déjà pris. ignore(...) exclut la ligne de la personne
            // elle-même : sans ça, garder son propre e-mail serait refusé ("déjà utilisé").
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($utilisateur->id)],
        ]);

        $utilisateur->update($donnees_validees);

        return response()->json($utilisateur);
    }

    // PUT /api/profil/mot-de-passe
    public function modifier_mot_de_passe(Request $requete): JsonResponse
    {
        $donnees_validees = $requete->validate([
            // current_password : la valeur doit être le mot de passe actuel de la personne connectée
            'mot_de_passe_actuel' => ['required', 'current_password'],
            // confirmed : exige un second champ "nouveau_mot_de_passe_confirmation" identique
            'nouveau_mot_de_passe' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        // Le mot de passe est hashé automatiquement (cast 'hashed' du modèle User)
        $requete->user()->update(['password' => $donnees_validees['nouveau_mot_de_passe']]);

        return response()->json(['message' => 'Mot de passe modifié.']);
    }
}