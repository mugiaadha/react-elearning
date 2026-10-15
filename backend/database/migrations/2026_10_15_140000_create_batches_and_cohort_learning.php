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
        // 1. Create batches table (Cohort-based learning)
        Schema::create('batches', function (Blueprint $table) {
            $table->id();
            $table->string('brevet_id');
            $table->string('batch_name'); // e.g. "Batch 42 - Reguler"
            $table->string('batch_code')->unique(); // e.g. "BAT-AB-42"
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('status')->default('ongoing'); // open, ongoing, finished
            $table->json('curriculum')->nullable(); // Immutable snapshot of curriculum for this cohort
            $table->timestamps();

            $table->foreign('brevet_id')->references('id')->on('brevets')->cascadeOnDelete();
        });

        // 2. Add batch_id, status, and passed_at to enrollments
        Schema::table('enrollments', function (Blueprint $table) {
            $table->foreignId('batch_id')->nullable()->after('brevet_id')->constrained('batches')->nullOnDelete();
            $table->string('status')->default('ACTIVE')->after('payment_status'); // ACTIVE, PASSED, COMPLETED
            $table->timestamp('passed_at')->nullable()->after('progress_percentage');
        });

        // 3. Add batch_id to submissions
        Schema::table('submissions', function (Blueprint $table) {
            $table->foreignId('batch_id')->nullable()->after('brevet_id')->constrained('batches')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropForeign(['batch_id']);
            $table->dropColumn('batch_id');
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropForeign(['batch_id']);
            $table->dropColumn(['batch_id', 'status', 'passed_at']);
        });

        Schema::dropIfExists('batches');
    }
};
