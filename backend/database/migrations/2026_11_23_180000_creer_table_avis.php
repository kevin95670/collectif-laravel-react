<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('avis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evenement_id')->constrained('evenements')->cascadeOnDelete();
            $table->foreignId('auteur_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('note');   // de 1 à 5
            $table->text('commentaire')->nullable();
            $table->timestamps();

            // Un seul avis par personne et par événement, garanti par la base elle-même
            $table->unique(['evenement_id', 'auteur_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avis');
    }
};