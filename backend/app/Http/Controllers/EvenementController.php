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
use Illuminate\Support\Facades\Storage;
use App\Notifications\NouveauParticipant;
use App\Notifications\PlaceLiberee;

class EvenementController extends Controller
{

    // Nombre d'événements par page dans la recherche
    public const EVENEMENTS_PAR_PAGE = 6;

        // Renvoie la liste des événements à venir, une page à la fois.
    // GET /api/evenements?sport=football&ville=Lyon&date=2026-12-05&page=2&lat=45.75&lng=4.85
    public function index(Request $requete): JsonResponse
    {
        // La position est facultative, mais si elle est envoyée elle doit être une vraie coordonnée
        $requete->validate([
            'lat' => ['nullable', 'numeric', 'between:-90,90'],
            'lng' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        $requete_evenements = Evenement::query()
            ->with('organisateur:id,name')
            ->withCount('participants')
            ->where('est_annule', false)
            ->where('date_debut', '>=', now())
            ->orderBy('date_debut')
            ->orderBy('id');   // départage les événements qui commencent à la même heure

        // when(valeur, fonction) : la fonction ne s'exécute que si la valeur n'est pas vide.
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

        // Tri par distance : seulement si la latitude ET la longitude sont envoyées
        $latitude_utilisateur = $requete->query('lat');
        $longitude_utilisateur = $requete->query('lng');
        $trier_par_distance = is_numeric($latitude_utilisateur) && is_numeric($longitude_utilisateur);

        if ($trier_par_distance) {
            $latitude_utilisateur = (float) $latitude_utilisateur;
            $longitude_utilisateur = (float) $longitude_utilisateur;

            // Un degré de longitude est plus court qu'un degré de latitude (il se resserre vers les pôles) :
            // on le corrige avec le cosinus de la latitude de l'utilisateur.
            $correction_longitude = cos(deg2rad($latitude_utilisateur));

            // reorder() efface le tri par date ci-dessus, pour le refaire dans un autre ordre :
            // 1. les événements sans coordonnées en dernier, 2. le plus proche d'abord, 3. puis par date.
            // On compare des distances au carré (Pythagore sans la racine) : l'ordre est le même.
            $requete_evenements->reorder()
                ->orderByRaw('latitude is null')
                ->orderByRaw(
                    '(latitude - ?) * (latitude - ?) + ((longitude - ?) * ?) * ((longitude - ?) * ?)',
                    [
                        $latitude_utilisateur, $latitude_utilisateur,
                        $longitude_utilisateur, $correction_longitude,
                        $longitude_utilisateur, $correction_longitude,
                    ]
                )
                ->orderBy('date_debut')
                ->orderBy('id');
        }

        // paginate() ne charge que les événements de la page demandée (?page=2),
        // et compte le total grâce à une seconde requête SQL.
        $page_evenements = $requete_evenements->paginate(self::EVENEMENTS_PAR_PAGE);
        $evenements_de_la_page = $page_evenements->items();

        // La distance à afficher sur les cartes : calculée en PHP, avec la vraie formule, pour la page seulement
        if ($trier_par_distance) {
            foreach ($evenements_de_la_page as $evenement) {
                // Attribut ajouté à la volée : il sera dans le JSON mais pas dans la base
                $evenement->distance_km = $evenement->latitude === null
                    ? null
                    : round($this->calculer_distance_km(
                        $latitude_utilisateur, $longitude_utilisateur,
                        $evenement->latitude, $evenement->longitude
                    ), 1);
            }
        }

        // Pour chaque événement de la page : est-il dans les favoris de la personne connectée ?
        // Une seule requête pour toute la page (et non une par événement).
        $utilisateur = $requete->user('sanctum');
        $identifiants_favoris = $utilisateur
            ? $utilisateur->evenements_favoris()
                ->whereIn('evenements.id', collect($evenements_de_la_page)->pluck('id'))
                ->pluck('evenements.id')
            : collect();

        foreach ($evenements_de_la_page as $evenement) {
            $evenement->est_favori = $identifiants_favoris->contains($evenement->id);
        }

        return response()->json([
            'data' => $evenements_de_la_page,
            'page_courante' => $page_evenements->currentPage(),
            'derniere_page' => $page_evenements->lastPage(),
            'total' => $page_evenements->total(),
        ]);
    }

    // Distance à vol d'oiseau entre deux points, en kilomètres (formule de Haversine)
    private function calculer_distance_km(float $latitude_a, float $longitude_a, float $latitude_b, float $longitude_b): float
    {
        $rayon_de_la_terre_km = 6371;

        $ecart_latitude = deg2rad($latitude_b - $latitude_a);
        $ecart_longitude = deg2rad($longitude_b - $longitude_a);

        $a = sin($ecart_latitude / 2) ** 2
            + cos(deg2rad($latitude_a)) * cos(deg2rad($latitude_b)) * sin($ecart_longitude / 2) ** 2;

        return $rayon_de_la_terre_km * 2 * asin(sqrt($a));
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

        // Prévenir l'organisateur (sauf s'il s'est inscrit lui-même)
        if ($evenement->organisateur_id !== $utilisateur->id) {
            // notify() est fourni par le trait Notifiable du modèle User
            $evenement->organisateur->notify(new NouveauParticipant($evenement, $utilisateur));
        }

        // On renvoie l'événement à jour, pour que React n'ait pas à le redemander
        return response()->json($this->construire_detail_evenement($evenement, $utilisateur), 201);
    }

    // DELETE /api/evenements/{evenement}/inscription
    // DELETE /api/evenements/{evenement}/inscription
    public function quitter(Request $requete, Evenement $evenement): JsonResponse
    {
        $utilisateur = $requete->user();

        // On note l'état AVANT le départ : c'est le passage de "complet" à "plus complet" qui compte
        $etait_complet = $this->est_complet($evenement);
        $etait_inscrit = $evenement->participants()->where('users.id', $utilisateur->id)->exists();

        // detach() supprime la ligne de la table "inscriptions" (sans erreur si elle n'existe pas)
        $evenement->participants()->detach($utilisateur->id);

        // Quelqu'un qui n'était pas inscrit ne libère aucune place
        if ($etait_complet && $etait_inscrit) {
            $this->prevenir_favoris_place_liberee($evenement, $utilisateur->id);
        }

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
            'est_favori' => $utilisateur !== null
                && $utilisateur->evenements_favoris()->where('evenements.id', $evenement->id)->exists(),
            'peut_donner_un_avis' => $utilisateur !== null && $evenement->peut_etre_note_par($utilisateur),
            'mon_avis' => $utilisateur !== null
                ? $evenement->avis()->where('auteur_id', $utilisateur->id)->first(['id', 'note', 'commentaire'])
                : null,
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
        // État avant la modification : on le compare à l'état d'après
        $etait_complet = $this->est_complet($evenement);

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

        // Plus de places : l'événement n'est plus complet, les favoris peuvent en profiter
        if ($etait_complet && ! $this->est_complet($evenement)) {
            $this->prevenir_favoris_place_liberee($evenement);
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

        // Toutes les places sont-elles prises ?
    private function est_complet(Evenement $evenement): bool
    {
        return $evenement->participants()->count() >= $evenement->nombre_places_max;
    }

    // Prévient les personnes qui ont l'événement en favori qu'une place s'est libérée.
    // $utilisateur_exclu : la personne qui vient de partir (inutile de la prévenir de son propre départ).
    private function prevenir_favoris_place_liberee(Evenement $evenement, ?int $utilisateur_exclu = null): void
    {
        // Rien à proposer pour un événement annulé ou déjà commencé
        if ($evenement->est_annule || $evenement->date_debut->isPast()) {
            return;
        }

        $destinataires = $evenement->utilisateurs_favoris()
            ->where('users.id', '!=', $evenement->organisateur_id)
            // whereDoesntHave : on écarte ceux qui sont déjà inscrits (ils ont déjà leur place)
            ->whereDoesntHave('evenements_inscrits', fn ($requete_sql) => $requete_sql->where('evenements.id', $evenement->id))
            ->when($utilisateur_exclu, fn ($requete_sql, $identifiant) => $requete_sql->where('users.id', '!=', $identifiant))
            ->get();

        Notification::send($destinataires, new PlaceLiberee($evenement));
    }

    // GET /api/sports : pour chaque sport, le nombre d'événements à venir (utilisé par l'accueil)
    public function compter_evenements_par_sport(): JsonResponse
    {
        // groupBy : un seul décompte par sport, calculé par la base.
        // pluck('nombre_evenements', 'sport') donne un tableau du type ['football' => 3, 'padel' => 1]
        $decomptes = Evenement::query()
            ->where('est_annule', false)
            ->where('date_debut', '>=', now())
            ->select('sport', DB::raw('count(*) as nombre_evenements'))
            ->groupBy('sport')
            ->pluck('nombre_evenements', 'sport');

        // On renvoie TOUS les sports, avec 0 quand il n'y a aucun événement
        $liste_des_sports = collect(Evenement::LISTE_DES_SPORTS)->map(fn ($sport) => [
            'sport' => $sport,
            'nombre_evenements' => $decomptes->get($sport, 0),   // get(clé, valeur par défaut)
        ]);

        return response()->json($liste_des_sports->values());
    }

    // POST /api/evenements/{evenement}/photo (envoi d'un fichier)
    public function televerser_photo(Request $requete, Evenement $evenement): JsonResponse
    {
        // Seul l'organisateur (même règle que pour modifier)
        Gate::authorize('modifier', $evenement);

        $requete->validate([
            // image : un vrai fichier image ; max en kilo-octets (5120 = 5 Mo)
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        // On supprime l'ancienne photo pour ne pas laisser de fichiers orphelins
        if ($evenement->photo_chemin !== null) {
            Storage::disk('public')->delete($evenement->photo_chemin);
        }

        // store() enregistre dans storage/app/public/evenements avec un nom aléatoire
        // et renvoie le chemin relatif ("evenements/abc123.jpg")
        $chemin_photo = $requete->file('photo')->store('evenements', 'public');

        $evenement->update(['photo_chemin' => $chemin_photo]);

        return response()->json($this->construire_detail_evenement($evenement, $requete->user()));
    }

    // DELETE /api/evenements/{evenement}/photo
    public function supprimer_photo(Request $requete, Evenement $evenement): JsonResponse
    {
        Gate::authorize('modifier', $evenement);

        if ($evenement->photo_chemin !== null) {
            Storage::disk('public')->delete($evenement->photo_chemin);
            $evenement->update(['photo_chemin' => null]);
        }

        return response()->json($this->construire_detail_evenement($evenement, $requete->user()));
    }
}
