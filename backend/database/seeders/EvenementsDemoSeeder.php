<?php

namespace Database\Seeders;

use App\Models\Evenement;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class EvenementsDemoSeeder extends Seeder
{
    // Les organisateurs de démonstration : l'adresse e-mail les identifie à chaque exécution
    private const ORGANISATEURS = [
        'camille' => ['nom' => 'Camille R.', 'email' => 'demo-camille@collectif.test'],
        'yanis'   => ['nom' => 'Yanis B.',   'email' => 'demo-yanis@collectif.test'],
        'lucie'   => ['nom' => 'Lucie M.',   'email' => 'demo-lucie@collectif.test'],
    ];

    // Les personnes inscrites aux événements
    private const PARTICIPANTS = [
        'Léo M.' => 'demo-leo@collectif.test',
        'Inès B.' => 'demo-ines@collectif.test',
        'Hugo T.' => 'demo-hugo@collectif.test',
        'Sarah K.' => 'demo-sarah@collectif.test',
        'Nathan D.' => 'demo-nathan@collectif.test',
        'Julie P.' => 'demo-julie@collectif.test',
    ];

    public function run(): void
    {
        $this->supprimer_anciens_evenements_de_demonstration();

        // Les organisateurs et les participants reçoivent un mot de passe aléatoire :
        // personne ne peut se connecter à leur place
        $organisateurs = [];
        foreach (self::ORGANISATEURS as $cle => $donnees) {
            $organisateurs[$cle] = $this->creer_utilisateur($donnees['nom'], $donnees['email'], Str::random(40));
        }

        $participants = collect();
        foreach (self::PARTICIPANTS as $nom => $email) {
            $participants->push($this->creer_utilisateur($nom, $email, Str::random(40)));
        }

        // Le seul compte avec un mot de passe connu, à indiquer dans le README :
        // il permet à un visiteur d'essayer de rejoindre un événement ou d'écrire dans le chat
        $this->creer_utilisateur('Visiteur démo', 'demo@collectif.test', 'demo-collectif');

        foreach ($this->evenements_a_creer() as $position => $donnees) {
            $debut = now()->addDays($donnees['jours'])->setTime($donnees['heure'], $donnees['minute']);

            $evenement = Evenement::create([
                'titre' => $donnees['titre'],
                'description' => $donnees['description'],
                'sport' => $donnees['sport'],
                'adresse' => $donnees['adresse'],
                'ville' => $donnees['ville'],
                // "dans X jours, à telle heure" : toujours à venir, quel que soit le jour d'exécution
                'date_debut' => $debut,
                'date_fin' => $debut->copy()->addMinutes($donnees['duree_minutes']),
                'nombre_places_max' => $donnees['places'],
                'est_annule' => false,
                'organisateur_id' => $organisateurs[$donnees['organisateur']]->id,
                // ?? : si l'événement n'a pas de clé "image", on prend l'image de son sport
                'photo_chemin' => $this->enregistrer_photo($donnees['image'] ?? 'sport-' . $donnees['sport']),
            ]);

            // slice($position % 2) : les inscrits ne sont pas toujours les mêmes d'un événement à l'autre
            $inscrits = $participants->slice($position % 2)->take($donnees['inscrits'])->values();
            $evenement->participants()->attach($inscrits->pluck('id'));

            // Quelques messages dans le chat du premier événement
            if ($position === 0) {
                $this->ecrire_messages($evenement, $inscrits, $organisateurs[$donnees['organisateur']]);
            }
        }
    }

    // Les 9 événements : un par sport
    private function evenements_a_creer(): array
    {
        return [
            ['titre' => 'Foot à 7 au stade Charléty', 'sport' => 'football', 'organisateur' => 'camille', 'image' => 'rencontre-foot',
             'description' => "Match amical entre amateurs, tous niveaux. On forme les équipes sur place, apporte des chaussures de salle ou à crampons moulés.",
             'adresse' => '99 boulevard Kellermann', 'ville' => 'Paris',
             'jours' => 3, 'heure' => 19, 'minute' => 30, 'duree_minutes' => 120, 'places' => 14, 'inscrits' => 5],

            ['titre' => 'Basket entre amis au gymnase Japy', 'sport' => 'basket', 'organisateur' => 'camille',
             'description' => "Un 5 contre 5 sans prise de tête. Une bouteille d'eau et des baskets de salle suffisent.",
             'adresse' => '2 rue Japy', 'ville' => 'Paris',
             'jours' => 4, 'heure' => 20, 'minute' => 0, 'duree_minutes' => 120, 'places' => 12, 'inscrits' => 3],

            ['titre' => "Footing du dimanche autour du parc de la Tête d'Or", 'sport' => 'running', 'organisateur' => 'yanis', 'image' => 'rencontre-running',
             'description' => "Une boucle d'environ 10 km à allure tranquille (6 min au kilomètre). Café ensemble après la course.",
             'adresse' => 'Place du Général Leclerc', 'ville' => 'Lyon',
             'jours' => 5, 'heure' => 8, 'minute' => 30, 'duree_minutes' => 90, 'places' => 20, 'inscrits' => 4],

            ['titre' => 'Tournoi de padel en double', 'sport' => 'padel', 'organisateur' => 'lucie',
             'description' => "Un terrain, quatre joueurs : les places partent vite. Raquettes et balles prêtées sur place.",
             'adresse' => '45 rue Sainte-Catherine', 'ville' => 'Bordeaux',
             'jours' => 6, 'heure' => 18, 'minute' => 0, 'duree_minutes' => 90, 'places' => 4, 'inscrits' => 4],

            ['titre' => 'Double de tennis au jardin du Luxembourg', 'sport' => 'tennis', 'organisateur' => 'camille',
             'description' => "Échanges et petits matchs en double, niveau débutant à intermédiaire.",
             'adresse' => 'Rue Guynemer', 'ville' => 'Paris',
             'jours' => 7, 'heure' => 10, 'minute' => 0, 'duree_minutes' => 120, 'places' => 4, 'inscrits' => 2],

            ['titre' => 'Randonnée vers la calanque de Sormiou', 'sport' => 'randonnee', 'organisateur' => 'yanis', 'image' => 'rencontre-randonnee',
             'description' => "Environ 5 heures de marche avec pique-nique et baignade. Prévoir de l'eau, une casquette et de bonnes chaussures.",
             'adresse' => 'Chemin de Sormiou', 'ville' => 'Marseille',
             'jours' => 8, 'heure' => 9, 'minute' => 0, 'duree_minutes' => 300, 'places' => 15, 'inscrits' => 2],

            ['titre' => 'Natation matinale à la piscine Molitor', 'sport' => 'natation', 'organisateur' => 'camille',
             'description' => "Séance de longueurs en groupe, chacun à son rythme. On se retrouve à l'entrée.",
             'adresse' => '13 rue Nungesser et Coli', 'ville' => 'Paris',
             'jours' => 9, 'heure' => 7, 'minute' => 30, 'duree_minutes' => 60, 'places' => 10, 'inscrits' => 3],

            ['titre' => 'Sortie vélo le long de la Garonne', 'sport' => 'velo', 'organisateur' => 'lucie',
             'description' => "Environ 40 km sur piste cyclable, avec une pause à mi-parcours. Casque obligatoire.",
             'adresse' => 'Place de la Bourse', 'ville' => 'Bordeaux',
             'jours' => 10, 'heure' => 9, 'minute' => 0, 'duree_minutes' => 180, 'places' => 12, 'inscrits' => 4],

            ['titre' => 'Initiation au frisbee (ultimate) au parc Borély', 'sport' => 'autre', 'organisateur' => 'yanis',
             'description' => "On apprend les règles en dix minutes, puis on joue. Aucun matériel à apporter.",
             'adresse' => 'Avenue Clot Bey', 'ville' => 'Marseille',
             'jours' => 11, 'heure' => 17, 'minute' => 0, 'duree_minutes' => 120, 'places' => 16, 'inscrits' => 3],
        ];
    }

    // updateOrCreate : crée la personne, ou met à jour celle qui a déjà cette adresse e-mail
    private function creer_utilisateur(string $nom, string $email, string $mot_de_passe): User
    {
        return User::updateOrCreate(
            ['email' => $email],
            ['name' => $nom, 'password' => $mot_de_passe]   // le modèle hache le mot de passe tout seul
        );
    }

    // Efface les événements de démonstration d'une exécution précédente (et leurs photos)
    private function supprimer_anciens_evenements_de_demonstration(): void
    {
        $identifiants = User::whereIn('email', array_column(self::ORGANISATEURS, 'email'))->pluck('id');

        Evenement::whereIn('organisateur_id', $identifiants)->get()->each(function (Evenement $evenement) {
            if ($evenement->photo_chemin !== null) {
                Storage::disk('public')->delete($evenement->photo_chemin);
            }
            $evenement->participants()->detach();
            $evenement->messages()->delete();
            $evenement->delete();
        });
    }

    // Copie une image de public/images dans le stockage des photos d'événements
    private function enregistrer_photo(string $nom_image): ?string
    {
        $source = public_path('images/' . $nom_image . '.webp');

        // En local, ces images sont dans frontend/public, pas dans backend/public : pas de photo, sans erreur
        if (! file_exists($source)) {
            return null;
        }

        $chemin = 'evenements/demo-' . $nom_image . '.webp';
        Storage::disk('public')->put($chemin, file_get_contents($source));

        return $chemin;
    }

    private function ecrire_messages(Evenement $evenement, $inscrits, User $organisateur): void
    {
        $messages = [
            [$organisateur, "Bienvenue à tous ! Rendez-vous devant l'entrée 10 minutes avant le début."],
            [$inscrits[0], "Super, j'apporte un ballon de rechange."],
            [$inscrits[1], "Je serai un peu juste, j'arrive peut-être cinq minutes en retard."],
            [$organisateur, "Pas de souci, on commence à l'heure mais tu rejoins quand tu veux."],
        ];

        foreach ($messages as [$auteur, $contenu]) {
            Message::create([
                'evenement_id' => $evenement->id,
                'auteur_id' => $auteur->id,
                'contenu' => $contenu,
            ]);
        }
    }
}