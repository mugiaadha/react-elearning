<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    public $incrementing = false;
    protected $primaryKey = 'certificate_id';
    protected $keyType = 'string';

    protected $fillable = [
        'certificate_id',
        'user_id',
        'recipient_name',
        'course_title',
        'issue_date',
        'expiry_date',
        'grade',
        'score',
        'director_name',
        'status',
        'verification_url',
    ];

    protected $casts = [
        'score' => 'float',
        'issue_date' => 'date:Y-m-d',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
