<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Evenement;
use Illuminate\Validation\Rule;

// Une "Form Request" regroupe les règles de validation d'une action.
// Laravel l'exécute AVANT d'entrer dans la méthode du contrôleur :
// si une règle échoue, il renvoie directement une erreur 422 avec les messages.
class CreerEvenementRequete extends FormRequest
{
    // Qui a le droit de faire cette action ? La route est déjà protégée par auth:sanctum, donc : tout le monde ici.
    public function authorize(): bool
    {
        return true;
    }

    // Les règles de validation, champ par champ (comme les contraintes Assert de Symfony)
    public function rules(): array
    {
        return [
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'adresse' => 'required|string|max:255',
            'date_debut' => 'required|date|after:now',
            // after:date_debut : la fin doit être postérieure au champ date_debut
            'date_fin' => 'required|date|after:date_debut',
            'nombre_places_max' => 'required|integer|min:2|max:500',
            'sport' => ['required', Rule::in(Evenement::LISTE_DES_SPORTS)],
            'ville' => 'required|string|max:100',
        ];
    }

    // Des messages sur mesure pour les règles dont le texte par défaut serait maladroit.
    // La clé est "champ.règle". ModifierEvenementRequete hérite de cette méthode.
    public function messages(): array
    {
        return [
            'date_debut.after' => 'La date de début doit être dans le futur.',
            'date_fin.after' => 'La date de fin doit être après la date de début.',
        ];
    }
}