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
        Schema::create('company_profile', function (Blueprint $table) {
            $table->id();
            $table->string('company_name')->default('NAC Tax Center');
            $table->string('short_name')->default('NAC');
            $table->string('tagline')->default('Pusat Pelatihan & Sertifikasi Brevet Pajak Terakreditasi');
            $table->text('description')->nullable();
            $table->string('email')->default('info@nactaxcenter.id');
            $table->string('admission_email')->default('admisi@nactaxcenter.id');
            $table->string('phone')->default('+62 (021) 5290-8800');
            $table->string('whatsapp')->default('+62 812-8890-4123');
            $table->text('address')->nullable();
            $table->string('city')->default('Jakarta Selatan');
            $table->string('website_url')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('director_name')->default('Dr. H. Hendra Kusuma, S.E., Ak., M.Ak., CA., BKP.');
            $table->string('director_title')->default('Direktur Eksekutif Pendidikan');
            $table->string('accreditation_badge')->default('Pusat Pelatihan Brevet Pajak Terakreditasi');
            $table->string('copyright_text')->nullable();
            $table->json('social_links')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_profile');
    }
};

