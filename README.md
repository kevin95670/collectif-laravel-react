# Collectif

[![Déploiement](https://github.com/kevin95670/collectif-laravel-react/actions/workflows/deploy.yml/badge.svg)](https://github.com/kevin95670/collectif-laravel-react/actions/workflows/deploy.yml)

Un site pour **trouver et organiser des événements sportifs** près de chez soi : on crée un match, une sortie running ou une randonnée, d'autres personnes le rejoignent, et tout le monde échange dans un chat.

C'est un projet personnel de démonstration : une API **Laravel** et un site **React**, testés automatiquement et déployés à chaque `git push`.

**Site en ligne : https://collectif.kevinleonard.fr**

Pour essayer sans créer de compte : `demo@collectif.test` / `demo-collectif` (ce compte peut, par exemple, laisser un avis sur « Basket du jeudi au gymnase Japy »). Vous pouvez aussi vous inscrire avec n'importe quelle adresse : c'est un site de démonstration, n'y saisissez pas de vraies données.

## Ce que fait le site

- **Comptes** : inscription, connexion, déconnexion, modification du profil et du mot de passe, mot de passe oublié par e-mail.
- **Événements** : création, modification, annulation (réservées à l'organisateur), photo de couverture. La recherche (sport, ville, date) est paginée et ses filtres sont conservés dans l'adresse de la page : un résultat peut se partager par lien. La ville se saisit avec une autocomplétion d'adresse, et le bouton « Près de moi » trie les événements par distance grâce à la géolocalisation du navigateur.
- **Inscriptions** : rejoindre ou quitter un événement, avec un nombre de places maximum. Deux personnes qui cliquent en même temps sur la dernière place ne la prennent pas toutes les deux (verrou en base de données).
- **Favoris** : un cœur sur chaque événement et une page « Mes favoris ». Si une place se libère sur un événement complet que vous suivez, vous êtes prévenu.
- **Avis** : après un événement, les participants notent l'organisateur (de 1 à 5 étoiles, un seul avis par personne). La moyenne s'affiche sur la page de l'organisateur.
- **Chat par événement**, réservé à l'organisateur et aux inscrits, avec messages cités.
- **Notifications** : une cloche dans l'en-tête (nouveau participant, nouveaux messages, événement modifié ou annulé, place libérée) et des e-mails pour les modifications, annulations et places libérées.
- **Carte** du lieu : l'adresse est convertie en coordonnées par l'API Adresse du gouvernement, puis affichée avec Leaflet et OpenStreetMap.
- **Pages publiques** par sport et par organisateur (sans jamais exposer l'adresse e-mail), avec un aperçu soigné (titre, description, photo) quand un événement est partagé dans une messagerie ou un réseau social.
- **Interface responsive**, du téléphone à l'ordinateur.

## Technologies

| Partie | Outils |
|---|---|
| API | Laravel (PHP 8.3), Sanctum (authentification par cookie de session), Eloquent, Form Requests, Policies, notifications, file d'attente |
| Site | React, Vite, React Router, Tailwind CSS 4, Leaflet |
| Base de données | MySQL 8.4 |
| Développement | Docker Compose (PHP-FPM, nginx, MySQL, Redis, Mailpit, Vite) |
| Tests | PHPUnit : 79 tests de bout en bout sur l'API |
| Mise en ligne | GitHub Actions, déploiement par SSH et `rsync` sur un hébergement mutualisé |

## Architecture

- En ligne, le site et l'API sont servis par **le même domaine** : React à la racine, l'API sous `/api`. Les cookies de connexion fonctionnent donc sans configuration CORS.
- En local, le site (port 5173) et l'API (port 8000) sont deux serveurs séparés.

```
backend/    API Laravel (routes, contrôleurs, modèles, tests)
frontend/   Site React (pages, composants, appels à l'API)
.github/    Workflow de déploiement
```

## Lancer le projet en local

Il faut Docker.

```bash
# 1. Configuration
cp backend/.env.example backend/.env

# 2. Démarrer les conteneurs
docker compose up -d --build

# 3. Préparer l'API
docker compose exec php composer install
docker compose exec php php artisan key:generate
docker compose exec php php artisan migrate --seed
docker compose exec php php artisan storage:link
```

Puis :

- le site : http://localhost:5173
- l'API : http://localhost:8000/api
- les e-mails envoyés par l'application (Mailpit) : http://localhost:8025
- compte de test : `kevin@collectif.test` / `password`

Pour remplir la liste d'événements de démonstration :

```bash
docker compose exec php php artisan db:seed --class=EvenementsDemoSeeder
```

## Tests

```bash
docker compose exec php php artisan test
```

Les tests tournent sur une base SQLite en mémoire : ils ne touchent jamais à la base de développement, et un garde-fou refuse de démarrer si une autre base est configurée. Ils couvrent l'authentification, les événements, les inscriptions et les places, le chat, la réinitialisation du mot de passe, la pagination, la recherche par proximité, les favoris et la notification de place libérée, les avis, l'envoi de photo, l'aperçu du partage, la page d'un organisateur et le géocodage (avec l'API externe simulée).

## Déploiement

Chaque `git push` sur `master` lance un workflow GitHub Actions :

1. exécute les tests ;
2. construit le site React ;
3. installe les dépendances PHP de production ;
4. envoie les fichiers sur l'hébergement avec `rsync` (sans toucher au `.env`, aux logs ni aux photos envoyées) ;
5. lance les migrations et met en cache la configuration.

Si un test échoue, rien n'est mis en ligne.
