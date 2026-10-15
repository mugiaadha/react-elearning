<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Batch extends Model
{
    protected $fillable = [
        'brevet_id',
        'batch_name',
        'batch_code',
        'start_date',
        'end_date',
        'status',
        'curriculum',
    ];

    protected $casts = [
        'curriculum' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function brevet()
    {
        return $this->belongsTo(Brevet::class, 'brevet_id', 'id');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'batch_id', 'id');
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class, 'batch_id', 'id');
    }

    /**
     * Check if batch curriculum is initialized, or sync from brevet master curriculum
     */
    public function getEffectiveCurriculumAttribute()
    {
        if (!empty($this->curriculum) && is_array($this->curriculum)) {
            return $this->curriculum;
        }

        return $this->brevet?->curriculum ?? [];
    }
}
