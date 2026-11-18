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
    public function index()
    {
        $liste_evenements = Evenement::query()
            ->with('organisateur:id,name')       // charge l'organisateur, mais seulement id et name
            ->where('est_annule', false)         // on ne montre pas les événements annulés
            ->where('date_debut', '>=', now())   // ni les événements déjà passés
            ->orderBy('date_debut')              // du plus proche au plus lointain
            ->get();                             // exécute la requête, renvoie une collection

        // Laravel convertit la collection de modèles en JSON.
        return $liste_evenements;
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
