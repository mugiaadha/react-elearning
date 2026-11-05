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
        // 1. Update payments table: drop manual proof columns, add Midtrans columns
        Schema::table('payments', function (Blueprint $table) {
            // Drop unused manual payment columns if they exist
            if (Schema::hasColumn('payments', 'proof_image_url')) {
                $table->dropColumn('proof_image_url');
            }
            if (Schema::hasColumn('payments', 'sender_account_name')) {
                $table->dropColumn('sender_account_name');
            }
            if (Schema::hasColumn('payments', 'rejection_reason')) {
                $table->dropColumn('rejection_reason');
            }

            // Add Midtrans gateway columns
            if (!Schema::hasColumn('payments', 'snap_token')) {
                $table->string('snap_token')->nullable()->after('status');
            }
            if (!Schema::hasColumn('payments', 'snap_redirect_url')) {
                $table->text('snap_redirect_url')->nullable()->after('snap_token');
            }
            if (!Schema::hasColumn('payments', 'payment_type')) {
                $table->string('payment_type')->nullable()->after('snap_redirect_url');
            }
            if (!Schema::hasColumn('payments', 'transaction_id')) {
                $table->string('transaction_id')->nullable()->index()->after('payment_type');
            }
            if (!Schema::hasColumn('payments', 'transaction_status')) {
                $table->string('transaction_status')->nullable()->after('transaction_id');
            }
            if (!Schema::hasColumn('payments', 'fraud_status')) {
                $table->string('fraud_status')->nullable()->after('transaction_status');
            }
            if (!Schema::hasColumn('payments', 'settlement_time')) {
                $table->timestamp('settlement_time')->nullable()->after('fraud_status');
            }
            if (!Schema::hasColumn('payments', 'metadata')) {
                $table->json('metadata')->nullable()->after('settlement_time');
            }
        });

        // 2. Update enrollments table: drop unused manual proof columns
        Schema::table('enrollments', function (Blueprint $table) {
            if (Schema::hasColumn('enrollments', 'payment_proof_url')) {
                $table->dropColumn('payment_proof_url');
            }
            if (Schema::hasColumn('enrollments', 'payment_notes')) {
                $table->dropColumn('payment_notes');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn([
                'snap_token',
                'snap_redirect_url',
                'payment_type',
                'transaction_id',
                'transaction_status',
                'fraud_status',
                'settlement_time',
                'metadata',
            ]);

            $table->string('proof_image_url')->nullable();
            $table->string('sender_account_name')->nullable();
            $table->text('rejection_reason')->nullable();
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->string('payment_proof_url')->nullable();
            $table->text('payment_notes')->nullable();
        });
    }
};

