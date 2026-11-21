<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evenements', function (Blueprint $table) {
            // nullable : si l'adresse n'est pas trouvée, l'événement existe quand même, sans carte.
            // decimal(10, 7) : 7 chiffres après la virgule, soit une précision d'environ 1 cm.
            $table->decimal('latitude', 10, 7)->nullable()->after('ville');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
        });
    }

    public function down(): void
    {
        Schema::table('evenements', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude']);
        });
    }
};
