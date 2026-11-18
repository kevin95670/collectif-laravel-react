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
        Schema::create('evenements', function (Blueprint $table) {
            $table->id();

            $table->string('titre');
            $table->text('description')->nullable();
            $table->string('adresse');
            $table->dateTime('date_debut');
            $table->dateTime('date_fin');
            $table->unsignedSmallInteger('nombre_places_max');
            $table->boolean('est_annule')->default(false);

            // Clé étrangère vers la table "users" (nom imposé par Laravel).
            // On précise 'users' car la colonne ne s'appelle pas "user_id".
            $table->foreignId('organisateur_id')->constrained('users')->cascadeOnDelete();

            $table->timestamps();   // ajoute created_at et updated_at, remplis automatiquement
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evenements');
    }
};
