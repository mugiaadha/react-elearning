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
        Schema::table('batches', function (Blueprint $table) {
            if (!Schema::hasColumn('batches', 'assigned_teacher_id')) {
                $table->foreignId('assigned_teacher_id')->nullable()->after('brevet_id')->constrained('users')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('batches', function (Blueprint $table) {
            if (Schema::hasColumn('batches', 'assigned_teacher_id')) {
                $table->dropForeign(['assigned_teacher_id']);
                $table->dropColumn('assigned_teacher_id');
            }
        });
    }
};

