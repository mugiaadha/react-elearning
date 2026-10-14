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
        // 1. Create master email_templates table
        Schema::create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique(); // e.g., 'email-verification', 'payment-approved', 'welcome-student'
            $table->string('name');
            $table->string('subject');
            $table->longText('body_html');
            $table->text('body_text')->nullable();
            $table->json('placeholders')->nullable(); // list of dynamic tags e.g. ['name', 'verification_code']
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Add verification code columns to users table
        Schema::table('users', function (Blueprint $table) {
            $table->string('email_verification_code', 10)->nullable()->after('email_verified_at');
            $table->timestamp('email_verification_expires_at')->nullable()->after('email_verification_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_templates');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['email_verification_code', 'email_verification_expires_at']);
        });
    }
};
