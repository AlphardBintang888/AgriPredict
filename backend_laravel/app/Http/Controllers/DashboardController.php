<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Return simulated JSON data for the frontend KPIs and recommendation table.
     */
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'kpi' => [
                'potensi_kenaikan_harga' => '12.5%',
                'penghematan_logistik' => 'Rp 2.4JT',
                'kontrak_pasokan_aktif' => 4
            ],
            'rekomendasi_smart_matching' => [
                [
                    'petani' => 'Poktan Makmur Jaya',
                    'lokasi' => 'Kediri, Jatim',
                    'komoditas' => 'Cabai Rawit',
                    'volume' => '500 kg',
                    'harga_estimasi' => 'Rp 42.000/kg',
                    'status' => 'Cocok 98%'
                ],
                [
                    'petani' => 'Tani Makmur',
                    'lokasi' => 'Nganjuk, Jatim',
                    'komoditas' => 'Bawang Merah',
                    'volume' => '1.2 Ton',
                    'harga_estimasi' => 'Rp 28.500/kg',
                    'status' => 'Cocok 95%'
                ],
                [
                    'petani' => 'KUD Subur',
                    'lokasi' => 'Demak, Jateng',
                    'komoditas' => 'Bawang Merah',
                    'volume' => '800 kg',
                    'harga_estimasi' => 'Rp 29.000/kg',
                    'status' => 'Cocok 88%'
                ]
            ]
        ]);
    }
}
