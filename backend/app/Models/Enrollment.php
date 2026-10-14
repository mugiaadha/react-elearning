<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    protected $fillable = [
        'user_id',
        'brevet_id',
        'invoice_number',
        'amount',
        'payment_method',
        'payment_status',
        'payment_proof_url',
        'payment_notes',
        'progress_percentage',
        'completed_lessons',
        'is_active',
        'registered_date',
    ];

    protected $casts = [
        'completed_lessons' => 'array',
        'is_active' => 'boolean',
        'amount' => 'integer',
        'progress_percentage' => 'integer',
        'registered_date' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function brevet()
    {
        return $this->belongsTo(Brevet::class, 'brevet_id', 'id');
    }
}
