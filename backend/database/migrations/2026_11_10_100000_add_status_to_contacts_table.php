<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('contacts')) {
            Schema::table('contacts', function (Blueprint $table) {
                if (!Schema::hasColumn('contacts', 'status')) {
                    $table->string('status', 30)->default('UNREAD')->after('message');
                }
                if (!Schema::hasColumn('contacts', 'source')) {
                    $table->string('source', 50)->default('contact')->after('status');
                }
                if (!Schema::hasColumn('contacts', 'replied_at')) {
                    $table->timestamp('replied_at')->nullable()->after('source');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('contacts')) {
            Schema::table('contacts', function (Blueprint $table) {
                $cols = [];
                foreach (['status', 'source', 'replied_at'] as $col) {
                    if (Schema::hasColumn('contacts', $col)) {
                        $cols[] = $col;
                    }
                }
                if (!empty($cols)) {
                    $table->dropColumn($cols);
                }
            });
        }
    }
};

