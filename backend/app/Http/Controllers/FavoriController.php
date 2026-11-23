<?php

namespace App\Http\Controllers;

use App\Models\Evenement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriController extends Controller
{
    // GET /api/mes-favoris : les favoris de la personne connectée, à venir seulement
    public function lister(Request $requete): JsonResponse
    {
        $evenements = $requete->user()->evenements_favoris()
            ->with('organisateur:id,name')
            ->withCount('participants')
            ->where('date_debut', '>=', now())
            ->orderBy('date_debut')
            ->orderBy('evenements.id')   // "evenements." : la table des favoris a aussi une colonne id
            ->get();

        foreach ($evenements as $evenement) {
            $evenement->est_favori = true;
        }

        // pivot : les colonnes de la table "favoris", inutiles pour React
        return response()->json($evenements->makeHidden('pivot'));
    }

    // POST /api/evenements/{evenement}/favori
    public function ajouter(Request $requete, Evenement $evenement): JsonResponse
    {
        // syncWithoutDetaching : ajoute le lien s'il n'existe pas, ne fait rien sinon (pas d'erreur de doublon)
        $requete->user()->evenements_favoris()->syncWithoutDetaching([$evenement->id]);

        return response()->json(['est_favori' => true], 201);
    }

    // DELETE /api/evenements/{evenement}/favori
    public function retirer(Request $requete, Evenement $evenement): JsonResponse
    {
        $requete->user()->evenements_favoris()->detach($evenement->id);

        return response()->json(['est_favori' => false]);
    }
}