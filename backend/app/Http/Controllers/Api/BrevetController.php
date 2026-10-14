<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brevet;
use Illuminate\Http\Request;

class BrevetController extends Controller
{
    /**
     * Get all Brevets list
     */
    public function index()
    {
        $brevets = Brevet::all();

        return response()->json([
            'success' => true,
            'message' => 'Daftar program pelatihan Brevet Pajak berhasil diambil.',
            'data' => $brevets,
        ]);
    }

    /**
     * Get single Brevet by id or slug
     */
    public function show($idOrSlug)
    {
        $brevet = Brevet::where('slug', $idOrSlug)
            ->orWhere('id', $idOrSlug)
            ->first();

        if (!$brevet) {
            return response()->json([
                'success' => false,
                'message' => "Program Brevet dengan slug/ID '{$idOrSlug}' tidak ditemukan.",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail program Brevet Pajak berhasil diambil.',
            'data' => $brevet,
        ]);
    }
}
