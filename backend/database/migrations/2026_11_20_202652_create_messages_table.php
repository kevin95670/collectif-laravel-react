<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            // Si l'événement est supprimé, ses messages aussi
            $table->foreignId('evenement_id')->constrained('evenements')->cascadeOnDelete();
            // L'auteur du message (un User). Si le compte est supprimé, ses messages aussi.
            $table->foreignId('auteur_id')->constrained('users')->cascadeOnDelete();
            // Le message auquel on répond (null = message ordinaire), une clé vers la même table.
            // nullOnDelete : si le message cité disparaît, la réponse reste, sans citation.
            $table->foreignId('reponse_a_id')->nullable()->constrained('messages')->nullOnDelete();
            $table->text('contenu');
            $table->timestamps();   // created_at = l'heure d'envoi

            // Index : retrouver vite les messages d'un événement, dans l'ordre
            $table->index(['evenement_id', 'id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
