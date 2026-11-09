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
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content');
            $table->string('category')->default('Regulasi Pajak');
            $table->string('image_url')->nullable();
            $table->string('attachment_url')->nullable();
            $table->string('attachment_name')->nullable();
            $table->string('read_time')->default('5 Menit Baca');
            $table->string('author_name')->default('Tim Pakar NAC Tax Center');
            $table->string('author_role')->default('Konsultan Pajak Terdaftar (BKP)');
            $table->string('author_avatar')->nullable();
            $table->json('tags')->nullable();
            $table->string('status')->default('PUBLISHED'); // PUBLISHED, DRAFT
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('views_count')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
    }
};

