<?php

namespace App\Policies;

use App\Models\Evenement;
use App\Models\User;

// Laravel associe automatiquement EvenementPolicy au modèle Evenement (même nom + "Policy").
// Chaque méthode répond à la question : "cette personne a-t-elle le droit de ... ?"
class EvenementPolicy
{
    // Seul l'organisateur peut modifier, et seulement tant que l'événement n'est pas annulé
    public function modifier(User $utilisateur, Evenement $evenement): bool
    {
        return $utilisateur->id === $evenement->organisateur_id && ! $evenement->est_annule;
    }

    // Même règle pour annuler (on ne peut pas annuler deux fois)
    public function annuler(User $utilisateur, Evenement $evenement): bool
    {
        return $utilisateur->id === $evenement->organisateur_id && ! $evenement->est_annule;
    }

    // Lire le chat : l'organisateur ou une personne inscrite
    public function lire_messages(User $utilisateur, Evenement $evenement): bool
    {
        $est_organisateur = $utilisateur->id === $evenement->organisateur_id;

        $est_inscrit = $evenement->participants()
            ->where('users.id', $utilisateur->id)
            ->exists();

        return $est_organisateur || $est_inscrit;
    }

    // Écrire : mêmes personnes, et seulement si l'événement n'est pas annulé
    public function ecrire_message(User $utilisateur, Evenement $evenement): bool
    {
        return $this->lire_messages($utilisateur, $evenement) && ! $evenement->est_annule;
    }
}