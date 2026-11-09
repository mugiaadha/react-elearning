<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    protected $table = 'blog_posts';

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'category',
        'image_url',
        'attachment_url',
        'attachment_name',
        'read_time',
        'author_name',
        'author_role',
        'author_avatar',
        'tags',
        'status',
        'is_featured',
        'views_count',
        'published_at',
    ];

    protected $casts = [
        'tags' => 'array',
        'is_featured' => 'boolean',
        'views_count' => 'integer',
        'published_at' => 'datetime',
    ];
}

