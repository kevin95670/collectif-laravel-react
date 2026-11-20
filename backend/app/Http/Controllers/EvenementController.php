<?php

namespace App\Http\Controllers;

use App\Models\Evenement;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\CreerEvenementRequete;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\ModifierEvenementRequete;
use Illuminate\Support\Facades\Gate;
use App\Notifications\EvenementAnnule;
use App\Notifications\EvenementModifie;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Notification;

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
    
    // GET /api/evenements/{evenement}
    // "Evenement $evenement" : Laravel lit l'id dans l'URL, va chercher l'événement
    // et renvoie une erreur 404 s'il n'existe pas ("route model binding", comme MapEntity en Symfony).
    // Le nom de la variable doit être le même que {evenement} dans la route.
    public function afficher(Request $requete, Evenement $evenement): JsonResponse
    {
        // Route publique : on ne passe pas par auth:sanctum, donc on demande
        // explicitement la personne connectée (ou null si personne).
        $utilisateur_connecte = $requete->user('sanctum');

        return response()->json($this->construire_detail_evenement($evenement, $utilisateur_connecte));
    }

    // POST /api/evenements/{evenement}/inscription
    public function rejoindre(Request $requete, Evenement $evenement): JsonResponse
    {
        $utilisateur = $requete->user();

        // La transaction regroupe les vérifications ET l'inscription : tout ou rien.
        // La fonction renvoie un message d'erreur, ou null si l'inscription a réussi.
        $message_erreur = DB::transaction(function () use ($evenement, $utilisateur) {

            // lockForUpdate() verrouille la ligne de l'événement jusqu'à la fin de la transaction.
            // Si deux personnes cliquent en même temps sur la dernière place, la seconde attend
            // que la première ait fini, puis voit que l'événement est complet.
            // (Équivalent du verrou pessimiste PESSIMISTIC_WRITE de Doctrine.)
            $evenement_verrouille = Evenement::query()->lockForUpdate()->findOrFail($evenement->id);

            if ($evenement_verrouille->est_annule) {
                return 'Cet événement est annulé.';
            }

            if ($evenement_verrouille->date_debut->isPast()) {
                return 'Cet événement a déjà commencé.';
            }

            $est_deja_inscrit = $evenement_verrouille->participants()
                ->where('users.id', $utilisateur->id)
                ->exists();
            if ($est_deja_inscrit) {
                return 'Tu es déjà inscrit à cet événement.';
            }

            if ($evenement_verrouille->participants()->count() >= $evenement_verrouille->nombre_places_max) {
                return 'Cet événement est complet.';
            }

            // attach() ajoute une ligne dans la table "inscriptions"
            $evenement_verrouille->participants()->attach($utilisateur->id);

            return null;
        });

        if ($message_erreur !== null) {
            return response()->json(['message' => $message_erreur], 422);
        }

        // On renvoie l'événement à jour, pour que React n'ait pas à le redemander
        return response()->json($this->construire_detail_evenement($evenement, $utilisateur), 201);
    }

    // DELETE /api/evenements/{evenement}/inscription
    public function quitter(Request $requete, Evenement $evenement): JsonResponse
    {
        $utilisateur = $requete->user();

        // detach() supprime la ligne de la table "inscriptions" (sans erreur si elle n'existe pas)
        $evenement->participants()->detach($utilisateur->id);

        return response()->json($this->construire_detail_evenement($evenement, $utilisateur));
    }

    // Prépare la réponse détaillée d'un événement : ses données + organisateur,
    // participants, places restantes, et si la personne connectée est inscrite.
    private function construire_detail_evenement(Evenement $evenement, ?User $utilisateur): array
    {
        // fresh() recharge l'événement depuis la base ; load() charge les relations
        $evenement = $evenement->fresh();
        $evenement->load(['organisateur:id,name', 'participants:id,name']);

        $nombre_de_participants = $evenement->participants->count();

        return [
            ...$evenement->toArray(),   // "..." recopie toutes les clés du tableau de l'événement
            'nombre_de_participants' => $nombre_de_participants,
            'nombre_places_restantes' => max(0, $evenement->nombre_places_max - $nombre_de_participants),
            'utilisateur_est_inscrit' => $utilisateur !== null
                && $evenement->participants->contains('id', $utilisateur->id),
        ];
    }

    // GET /api/mes-evenements : les événements organisés et ceux où la personne est inscrite
    public function mes_evenements(Request $requete): JsonResponse
    {
        $utilisateur = $requete->user();

        // On passe par la relation : Laravel ajoute tout seul "where organisateur_id = ..."
        $evenements_organises = $utilisateur->evenements_organises()
            ->withCount('participants')   // ajoute la colonne participants_count
            ->orderBy('date_debut')
            ->get();

        $evenements_inscrits = $utilisateur->evenements_inscrits()
            ->with('organisateur:id,name')
            ->withCount('participants')
            ->orderBy('date_debut')
            ->get();

        return response()->json([
            'organises' => $evenements_organises,
            'inscrits' => $evenements_inscrits,
        ]);
    }

    // PUT /api/evenements/{evenement}
    public function modifier(ModifierEvenementRequete $requete, Evenement $evenement): JsonResponse
    {
        $evenement->update($requete->validated());

        // Seules ces modifications méritent d'avertir les participants
        // (changer la description ou le nombre de places ne déclenche pas d'e-mail).
        $champs_a_signaler = ['titre', 'adresse', 'ville', 'date_debut', 'date_fin'];

        // getChanges() : ce que update() vient réellement de modifier (rien si la valeur est identique).
        // array_intersect garde seulement les champs de notre liste.
        $champs_modifies = array_intersect(array_keys($evenement->getChanges()), $champs_a_signaler);

        if (count($champs_modifies) > 0) {
            // Notification::send envoie à chaque personne de la liste ; chaque envoi part dans la file d'attente
            Notification::send(
                $this->recuperer_participants_a_prevenir($evenement),
                new EvenementModifie($evenement, $champs_modifies)
            );
        }

        return response()->json($this->construire_detail_evenement($evenement, $requete->user()));
    }

    // POST /api/evenements/{evenement}/annulation
    public function annuler(Request $requete, Evenement $evenement): JsonResponse
    {
        Gate::authorize('annuler', $evenement);

        $evenement->update(['est_annule' => true]);

        Notification::send(
            $this->recuperer_participants_a_prevenir($evenement),
            new EvenementAnnule($evenement)
        );

        return response()->json($this->construire_detail_evenement($evenement, $requete->user()));
    }

    // Les inscrits, sauf l'organisateur : inutile de le prévenir de ses propres actions
    private function recuperer_participants_a_prevenir(Evenement $evenement): Collection
    {
        return $evenement->participants()
            ->where('users.id', '!=', $evenement->organisateur_id)
            ->get();
    }
}
