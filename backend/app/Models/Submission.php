<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'student_name',
        'course',
        'task',
        'submitted_at',
        'file_size',
        'status',
        'score',
    ];

    protected $casts = [
        'score' => 'integer',
    ];
}
