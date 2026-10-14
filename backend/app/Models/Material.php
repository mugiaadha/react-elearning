<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    protected $fillable = [
        'brevet_id',
        'title',
        'target_module',
        'file_type',
        'file_url',
        'created_date_text',
        'status',
    ];

    public function brevet()
    {
        return $this->belongsTo(Brevet::class, 'brevet_id', 'id');
    }
}
