<?php

namespace App\Http\Requests;

// Hérite de CreerEvenementRequete : on reprend ses règles et on ne change que le nécessaire.
class ModifierEvenementRequete extends CreerEvenementRequete
{
    // Ici l'autorisation n'est plus "tout le monde" : on interroge la Policy.
    public function authorize(): bool
    {
        // $this->route('evenement') : l'événement trouvé grâce à {evenement} dans l'URL.
        // can('modifier', ...) appelle EvenementPolicy::modifier. Si false : réponse 403.
        return $this->user()->can('modifier', $this->route('evenement'));
    }

    public function rules(): array
    {
        $evenement = $this->route('evenement');
        $nombre_de_participants = $evenement->participants()->count();

        // parent::rules() = les règles de la création ; array_merge remplace celles qu'on redéfinit.
        // On ne peut pas descendre sous le nombre d'inscrits (ni sous 2 places).
        return array_merge(parent::rules(), [
            'nombre_places_max' => ['required', 'integer', 'min:' . max(2, $nombre_de_participants), 'max:500'],
        ]);
    }
}