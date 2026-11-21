<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // GET /api/notifications : les 20 dernières notifications + le nombre de non lues
    public function lister(Request $requete): JsonResponse
    {
        $utilisateur = $requete->user();

        // notifications() est triée de la plus récente à la plus ancienne
        $notifications = $utilisateur->notifications()->limit(20)->get()->map(fn ($notification) => [
            'id' => $notification->id,
            'titre' => $notification->data['titre'],
            'detail' => $notification->data['detail'],
            'evenement_id' => $notification->data['evenement_id'],
            'est_lue' => $notification->read_at !== null,
            'created_at' => $notification->created_at,
        ]);

        return response()->json([
            'nombre_non_lues' => $utilisateur->unreadNotifications()->count(),
            'notifications' => $notifications,
        ]);
    }

    // POST /api/notifications/{identifiant}/lue
    public function marquer_comme_lue(Request $requete, string $identifiant): JsonResponse
    {
        // On cherche DANS les notifications de la personne connectée : impossible de toucher à celles d'un autre
        // (findOrFail renvoie une 404 si elle n'existe pas ou n'est pas à elle)
        $requete->user()->notifications()->findOrFail($identifiant)->markAsRead();

        return response()->json(['message' => 'Notification lue.']);
    }

    // POST /api/notifications/tout-lire
    public function tout_marquer_comme_lu(Request $requete): JsonResponse
    {
        $requete->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'Toutes les notifications sont lues.']);
    }
}