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
        // 1. Modify users table
        Schema::table('users', function (Blueprint $table) {
            $table->string('string_id')->nullable()->after('id');
            $table->string('phone')->nullable()->after('email');
            $table->string('role')->default('student')->after('phone');
            $table->string('avatar')->nullable()->after('role');
            $table->string('payment_status')->default('PENDING_APPROVAL')->after('avatar');
        });

        // 2. Brevets table
        Schema::create('brevets', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. 'brevet-ab'
            $table->string('slug')->unique();
            $table->string('title');
            $table->string('badge')->nullable();
            $table->text('tagline')->nullable();
            $table->text('description');
            $table->string('level');
            $table->string('duration');
            $table->integer('total_hours')->default(0);
            $table->bigInteger('price')->default(0);
            $table->bigInteger('original_price')->nullable();
            $table->integer('discount_percentage')->nullable();
            $table->decimal('rating', 3, 2)->default(5.0);
            $table->integer('total_reviews')->default(0);
            $table->integer('total_enrolled')->default(0);
            $table->string('thumbnail')->nullable();
            $table->json('instructor')->nullable();
            $table->json('features')->nullable();
            $table->json('curriculum')->nullable();
            $table->timestamps();
        });

        // 3. Enrollments table
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('brevet_id');
            $table->string('invoice_number')->nullable();
            $table->bigInteger('amount')->default(0);
            $table->string('payment_method')->default('QRIS Dinamis');
            $table->string('payment_status')->default('PENDING_APPROVAL');
            $table->string('payment_proof_url')->nullable();
            $table->text('payment_notes')->nullable();
            $table->integer('progress_percentage')->default(0);
            $table->json('completed_lessons')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamp('registered_date')->nullable();
            $table->timestamps();

            $table->foreign('brevet_id')->references('id')->on('brevets')->cascadeOnDelete();
        });

        // 4. Payments table
        Schema::create('payments', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. 'PAY-2026-0892'
            $table->string('invoice_number')->index();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('student_name');
            $table->string('student_email');
            $table->string('student_phone')->nullable();
            $table->string('brevet_id');
            $table->string('brevet_title');
            $table->bigInteger('amount');
            $table->string('payment_method');
            $table->timestamp('transaction_time')->nullable();
            $table->string('proof_image_url')->nullable();
            $table->string('status')->default('PENDING_APPROVAL');
            $table->string('sender_account_name')->nullable();
            $table->text('notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });

        // 5. Certificates table
        Schema::create('certificates', function (Blueprint $table) {
            $table->string('certificate_id')->primary(); // e.g. 'NAC-CERT-2026-AB-88219'
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('recipient_name');
            $table->string('course_title');
            $table->date('issue_date');
            $table->string('expiry_date')->default('Seumur Hidup');
            $table->string('grade');
            $table->decimal('score', 4, 1)->default(90.0);
            $table->string('director_name')->default('Dr. Hendrawan Kartiko, S.E., S.H., LL.M., BKP C');
            $table->string('status')->default('VALID');
            $table->string('verification_url')->nullable();
            $table->timestamps();
        });

        // 6. Materials table (Course syllabus materials uploaded by teachers)
        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->string('brevet_id');
            $table->string('title');
            $table->string('target_module');
            $table->string('file_type')->default('PDF');
            $table->string('file_url')->nullable();
            $table->string('created_date_text')->nullable();
            $table->string('status')->default('Tersedia untuk Mahasiswa');
            $table->timestamps();
        });

        // 7. Submissions table (Student tasks for teacher review)
        Schema::create('submissions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('student_name');
            $table->string('course');
            $table->string('task');
            $table->string('submitted_at');
            $table->string('file_size');
            $table->string('status')->default('PENDING'); // PENDING, GRADED
            $table->integer('score')->nullable();
            $table->timestamps();
        });

        // 8. Contact messages
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('contact');
            $table->text('message');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contacts');
        Schema::dropIfExists('submissions');
        Schema::dropIfExists('materials');
        Schema::dropIfExists('certificates');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('enrollments');
        Schema::dropIfExists('brevets');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['string_id', 'phone', 'role', 'avatar', 'payment_status']);
        });
    }
};
