<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evenements', function (Blueprint $table) {
            // default(...) est obligatoire : la table contient déjà des lignes,
            // il faut une valeur pour elles.
            $table->string('sport')->default('autre')->after('description');
            $table->string('ville')->default('')->after('adresse');
        });
    }

    // down() annule la migration (php artisan migrate:rollback)
    public function down(): void
    {
        Schema::table('evenements', function (Blueprint $table) {
            $table->dropColumn(['sport', 'ville']);
        });
    }
};
