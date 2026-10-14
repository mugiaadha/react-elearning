<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'student_name',
        'student_email',
        'course',
        'brevet_id',
        'module_id',
        'module_title',
        'task',
        'submission_url',
        'submission_notes',
        'submitted_at',
        'file_size',
        'status', // PENDING, APPROVED (Lulus), REVISION (Perlu Revisi), REJECTED
        'score',
        'teacher_feedback',
        'reviewed_at',
    ];

    protected $casts = [
        'score' => 'integer',
        'reviewed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
