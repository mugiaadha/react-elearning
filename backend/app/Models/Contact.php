<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $fillable = [
        'name',
        'contact',
        'message',
        'status',
        'source',
        'replied_at',
    ];

    protected $casts = [
        'replied_at' => 'datetime',
    ];
}
