<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Brevet extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'slug',
        'title',
        'badge',
        'tagline',
        'description',
        'level',
        'duration',
        'total_hours',
        'price',
        'original_price',
        'discount_percentage',
        'rating',
        'total_reviews',
        'total_enrolled',
        'thumbnail',
        'instructor',
        'features',
        'curriculum',
    ];

    protected $casts = [
        'instructor' => 'array',
        'features' => 'array',
        'curriculum' => 'array',
        'price' => 'integer',
        'original_price' => 'integer',
        'discount_percentage' => 'integer',
        'total_hours' => 'integer',
        'total_reviews' => 'integer',
        'total_enrolled' => 'integer',
        'rating' => 'float',
    ];

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class, 'brevet_id', 'id');
    }

    public function batches()
    {
        return $this->hasMany(Batch::class, 'brevet_id', 'id');
    }

    public function activeBatch()
    {
        return $this->hasOne(Batch::class, 'brevet_id', 'id')
            ->whereIn('status', ['open', 'ongoing'])
            ->latest('id');
    }

    public function materials()
    {
        return $this->hasMany(Material::class, 'brevet_id', 'id');
    }
}
