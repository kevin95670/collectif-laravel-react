<?php

namespace App\Http\Controllers;

use App\Models\Evenement;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class ApercuPartageController extends Controller
{
    // GET /evenements/{identifiant} : la page du site (pas l'API).
    // On sert la même page React que d'habitude, avec en plus les balises de partage de l'événement.
    public function afficher(string $identifiant): Response
    {
        $chemin_page = public_path('app.html');
        abort_unless(file_exists($chemin_page), 404);

        $html = file_get_contents($chemin_page);

        // Événement introuvable : on sert la page telle quelle, c'est React qui affichera "n'existe pas"
        $evenement = Evenement::find($identifiant);
        if ($evenement !== null) {
            $html = $this->ajouter_balises_de_partage($html, $evenement);
        }

        return response($html)
            ->header('Content-Type', 'text/html; charset=UTF-8')
            ->header('Cache-Control', 'no-cache');
    }

    private function ajouter_balises_de_partage(string $html, Evenement $evenement): string
    {
        $titre = $evenement->titre . ' · Collectif';
        $description = $this->construire_description($evenement);
        $adresse_page = config('app.frontend_url') . '/evenements/' . $evenement->id;
        $image = $this->trouver_image($evenement);

        // e() protège les caractères spéciaux (guillemets, <, &) : un titre ne peut pas casser la page
        $balises = [
            '<meta property="og:site_name" content="Collectif">',
            '<meta property="og:locale" content="fr_FR">',
            '<meta property="og:type" content="website">',
            '<meta property="og:title" content="' . e($titre) . '">',
            '<meta property="og:description" content="' . e($description) . '">',
            '<meta property="og:url" content="' . e($adresse_page) . '">',
            '<meta name="twitter:card" content="' . ($image ? 'summary_large_image' : 'summary') . '">',
        ];
        if ($image !== null) {
            $balises[] = '<meta property="og:image" content="' . e($image) . '">';
        }

        // On retire les balises de partage générales de index.html : celles de l'événement les remplacent
        $html = preg_replace('/<meta\s+(?:property|name)="(?:og|twitter):[^"]*"[^>]*>\s*/i', '', $html);

        // preg_replace_callback plutôt que preg_replace : un "$5" dans un titre ne doit pas être pris pour une consigne
        $html = preg_replace_callback('/<title>.*?<\/title>/s', fn () => '<title>' . e($titre) . '</title>', $html, 1);
        $html = preg_replace_callback('/<meta name="description"[^>]*>/', fn () => '<meta name="description" content="' . e($description) . '">', $html, 1);

        // On range les nouvelles balises juste avant la fin de l'en-tête
        return Str::replaceFirst('</head>', implode("\n", $balises) . "\n</head>", $html);
    }

    // "samedi 5 décembre 2026, 19:30 · 99 boulevard Kellermann, Paris. 9 places restantes. Match amical..."
    private function construire_description(Evenement $evenement): string
    {
        $date = $evenement->date_debut->locale('fr')->translatedFormat('l j F Y, H:i');
        $description = $date . ' · ' . $evenement->adresse . ', ' . $evenement->ville . '.';

        if ($evenement->est_annule) {
            $description .= ' Événement annulé.';
        } elseif ($evenement->date_debut->isPast()) {
            $description .= ' Événement terminé.';
        } else {
            $places_restantes = max(0, $evenement->nombre_places_max - $evenement->participants()->count());
            $description .= $places_restantes === 0
                ? ' Complet.'
                : ' ' . $places_restantes . ' place' . ($places_restantes > 1 ? 's' : '') . ' restante' . ($places_restantes > 1 ? 's' : '') . '.';
        }

        if ($evenement->description) {
            // On aplatit les retours à la ligne et on coupe : un aperçu fait quelques lignes, pas un texte entier
            $description .= ' ' . Str::limit(preg_replace('/\s+/', ' ', strip_tags($evenement->description)), 140);
        }

        return $description;
    }

    // La photo de l'événement, sinon l'image de son sport, sinon l'image générale du site
    private function trouver_image(Evenement $evenement): ?string
    {
        if ($evenement->photo_url !== null) {
            // Les robots ont besoin d'une adresse complète, avec "https://..."
            return Str::startsWith($evenement->photo_url, 'http')
                ? $evenement->photo_url
                : config('app.frontend_url') . $evenement->photo_url;
        }

        $candidats = [
            'images/sport-' . $evenement->sport . '.webp',
            'images/partage-collectif.jpg',
        ];

        foreach ($candidats as $fichier) {
            if (file_exists(public_path($fichier))) {
                return config('app.frontend_url') . '/' . $fichier;
            }
        }

        return null;
    }
}