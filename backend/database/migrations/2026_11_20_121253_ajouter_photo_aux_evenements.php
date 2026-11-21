<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evenements', function (Blueprint $table) {
            // Chemin du fichier dans le stockage (ex : "evenements/abc123.jpg"), null = pas de photo
            $table->string('photo_chemin')->nullable()->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('evenements', function (Blueprint $table) {
            $table->dropColumn('photo_chemin');
        });
    }
};
