<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('favoris', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('evenement_id')->constrained('evenements')->cascadeOnDelete();
            $table->timestamps();

            // Un même événement ne peut être mis qu'une fois en favori par la même personne
            $table->unique(['user_id', 'evenement_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('favoris');
    }
};