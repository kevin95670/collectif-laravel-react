<?php

namespace App\Http\Controllers;

use App\Models\Evenement;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\CreerEvenementRequete;

class EvenementController extends Controller
{
    // Renvoie la liste des événements à venir.
    // "index" est le nom d'usage de Laravel pour une action "lister" : ce n'est pas obligatoire,
    // mais tout le monde l'utilise, donc on le garde.
    // GET /api/evenements?sport=football&ville=Lyon&date=2026-12-05
    // Tous les filtres sont facultatifs : sans paramètre, on renvoie tout.
    public function index(Request $requete): JsonResponse
    {
        $requete_evenements = Evenement::query()
            ->with('organisateur:id,name')
            ->where('est_annule', false)
            ->where('date_debut', '>=', now())
            ->orderBy('date_debut');

        // when(valeur, fonction) : la fonction ne s'exécute que si la valeur n'est pas vide.
        // Ça évite une cascade de "if" pour chaque filtre.
        // $requete->query('sport') lit le paramètre ?sport=... de l'URL.
        $requete_evenements->when(
            $requete->query('sport'),
            fn ($requete_sql, $sport) => $requete_sql->where('sport', $sport)
        );

        // like '%lyon%' : la ville contient le texte saisi (insensible à la casse avec MySQL)
        $requete_evenements->when(
            $requete->query('ville'),
            fn ($requete_sql, $ville) => $requete_sql->where('ville', 'like', '%' . $ville . '%')
        );

        // whereDate : compare uniquement le jour, sans l'heure
        $requete_evenements->when(
            $requete->query('date'),
            fn ($requete_sql, $date) => $requete_sql->whereDate('date_debut', $date)
        );

        return response()->json($requete_evenements->get());
    }

    public function creer(CreerEvenementRequete $requete): JsonResponse
    {
        // validated() : uniquement les champs validés par CreerEvenementRequete
        $donnees_validees = $requete->validated();
        // L'organisateur est la personne connectée
        $donnees_validees['organisateur_id'] = $requete->user()->id;

        $evenement = Evenement::create($donnees_validees);

        return response()->json($evenement, 201);
    }
}
