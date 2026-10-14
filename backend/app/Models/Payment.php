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
        'transaction_time',
        'proof_image_url',
        'status',
        'sender_account_name',
        'notes',
        'rejection_reason',
        'approved_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'transaction_time' => 'datetime',
        'approved_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
