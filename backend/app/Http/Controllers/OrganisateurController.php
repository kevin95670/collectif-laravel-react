<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;

class OrganisateurController extends Controller
{
    // GET /api/organisateurs/{organisateur} : le profil public d'un organisateur
    // Route model binding : Laravel retrouve le User dont l'id est dans l'adresse (404 s'il n'existe pas).
    // Le nom du paramètre de route ({organisateur}) doit être le même que celui de la variable.
    public function afficher(User $organisateur): JsonResponse
    {
        // Une personne qui n'a jamais organisé n'a pas de page publique : on évite d'exposer n'importe quel compte
        abort_if(! $organisateur->evenements_organises()->exists(), 404);

        $evenements_a_venir = $organisateur->evenements_organises()
            ->where('est_annule', false)
            ->where('date_debut', '>=', now())
            ->withCount('participants')   // ajoute participants_count à chaque événement
            ->orderBy('date_debut')
            ->get();

        $nombre_evenements_passes = $organisateur->evenements_organises()
            ->where('est_annule', false)
            ->where('date_debut', '<', now())
            ->count();

        // On choisit les champs publics un par un : jamais l'e-mail ni le reste du compte
        return response()->json([
            'id' => $organisateur->id,
            'name' => $organisateur->name,
            'membre_depuis' => $organisateur->created_at,
            'nombre_evenements_passes' => $nombre_evenements_passes,
            'evenements_a_venir' => $evenements_a_venir,
        ]);
    }
}