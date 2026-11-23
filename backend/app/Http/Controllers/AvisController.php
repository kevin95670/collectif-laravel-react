<?php

namespace App\Http\Controllers;

use App\Models\Avis;
use App\Models\Evenement;
use App\Models\User;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvisController extends Controller
{
    // GET /api/organisateurs/{organisateur}/avis : route publique.
    // Jamais d'adresse e-mail : seulement le nom de l'auteur.
    public function lister(User $organisateur): JsonResponse
    {
        // Les avis laissés sur les événements de cet organisateur
        $requete_avis = Avis::query()
            ->whereHas('evenement', fn ($requete_sql) => $requete_sql->where('organisateur_id', $organisateur->id));

        // clone : on réutilise la même requête pour compter, puis pour faire la moyenne, puis pour lister
        $nombre = (clone $requete_avis)->count();
        $moyenne = $nombre > 0 ? round((clone $requete_avis)->avg('note'), 1) : null;

        $avis = $requete_avis
            ->with(['auteur:id,name', 'evenement:id,titre'])
            ->latest()
            ->orderByDesc('id')
            ->limit(20)
            ->get()
            ->map(fn (Avis $avis) => [
                'id' => $avis->id,
                'note' => $avis->note,
                'commentaire' => $avis->commentaire,
                'auteur' => $avis->auteur->name,
                'evenement_id' => $avis->evenement_id,
                'evenement_titre' => $avis->evenement->titre,
                'created_at' => $avis->created_at,
            ]);

        return response()->json([
            'moyenne' => $moyenne,
            'nombre' => $nombre,
            'avis' => $avis,
        ]);
    }

    // POST /api/evenements/{evenement}/avis
    public function creer(Request $requete, Evenement $evenement): JsonResponse
    {
        $utilisateur = $requete->user();

        // D'abord le droit de donner un avis, ensuite la validation des données
        if (! $evenement->peut_etre_note_par($utilisateur)) {
            return response()->json(['message' => "Tu ne peux pas donner d'avis sur cet événement."], 403);
        }

        $donnees = $requete->validate([
            'note' => ['required', 'integer', 'between:1,5'],
            'commentaire' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $avis = Avis::create([
                'evenement_id' => $evenement->id,
                'auteur_id' => $utilisateur->id,
                'note' => $donnees['note'],
                'commentaire' => $donnees['commentaire'] ?? null,
            ]);
        } catch (UniqueConstraintViolationException) {
            // Deux clics presque simultanés : la vérification ci-dessus a pu passer deux fois,
            // mais la contrainte d'unicité de la base refuse le second enregistrement
            return response()->json(['message' => 'Tu as déjà donné ton avis.'], 422);
        }

        return response()->json($avis->only(['id', 'note', 'commentaire']), 201);
    }
}