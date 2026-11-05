<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'invoice_number',
        'user_id',
        'student_name',
        'student_email',
        'student_phone',
        'brevet_id',
        'brevet_title',
        'amount',
        'payment_method',
        'payment_type',
        'transaction_time',
        'status',
        'snap_token',
        'snap_redirect_url',
        'transaction_id',
        'transaction_status',
        'fraud_status',
        'settlement_time',
        'metadata',
        'notes',
        'approved_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'transaction_time' => 'datetime',
        'settlement_time' => 'datetime',
        'approved_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
