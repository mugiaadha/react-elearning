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
        Schema::table('submissions', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->string('student_email')->nullable()->after('student_name');
            $table->string('brevet_id')->nullable()->after('course');
            $table->string('module_id')->nullable()->after('brevet_id');
            $table->string('module_title')->nullable()->after('module_id');
            $table->text('submission_url')->nullable()->after('task');
            $table->text('submission_notes')->nullable()->after('submission_url');
            $table->text('teacher_feedback')->nullable()->after('score');
            $table->timestamp('reviewed_at')->nullable()->after('teacher_feedback');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('specialization')->nullable()->after('role');
            $table->boolean('invited_by_admin')->default(false)->after('specialization');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['specialization', 'invited_by_admin']);
        });

        Schema::table('submissions', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn([
                'user_id',
                'student_email',
                'brevet_id',
                'module_id',
                'module_title',
                'submission_url',
                'submission_notes',
                'teacher_feedback',
                'reviewed_at',
            ]);
        });
    }
};
