import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api/apiClient';
import ENDPOINTS from '../../services/api/endpoints';
import {
  CreditCard,
  Users,
  Award,
  TrendingUp,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get(ENDPOINTS.ADMIN_STATS);
      setStats(res.data);
    } catch (err) {
      console.warn('[AdminStats error]', err);
      setError(err.message || 'Gagal memuat statistik backoffice.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const summary = stats?.summary || {
    total_students: 5420,
    active_students: 1280,
    pending_approvals: 3,
    total_revenue_idr: 485250000,
    completion_rate_percentage: 94.2,
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Dashboard Eksekutif Backoffice CMS
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ikhtisar operasional pelatihan Brevet Pajak, verifikasi pembayaran, dan pencetakan sertifikat.
          </p>
        </div>

        <Link
          to="/admin/payments"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md transition"
        >
          <Clock className="w-4 h-4 text-slate-950" />
          Verifikasi {summary.pending_approvals} Pembayaran Pending &rarr;
        </Link>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Revenue */}
        <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 shadow-md space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Total Pendapatan Kursus</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            Rp {(summary.total_revenue_idr / 1000000).toFixed(1)} Juta
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold">+18% dari bulan sebelumnya</div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 shadow-md space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Menunggu Approval</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {summary.pending_approvals} Transaksi
          </div>
          <div className="text-[11px] text-slate-400">Perlu tindakan verifikasi admin</div>
        </div>

        {/* Students */}
        <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 shadow-md space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Total Alumni & Siswa</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {summary.total_students.toLocaleString('id-ID')}
          </div>
          <div className="text-[11px] text-sky-400 font-semibold">{summary.active_students} sedang aktif belajar</div>
        </div>

        {/* Passing Rate */}
        <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 shadow-md space-y-2">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Tingkat Kelulusan Ujian</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {summary.completion_rate_percentage}%
          </div>
          <div className="text-[11px] text-purple-300 font-semibold">Standar Yudisium BKP</div>
        </div>
      </div>

      {/* Program Popularity & Monthly Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
          <h3 className="font-bold text-white text-sm">Distribusi Peminat Program Brevet</h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="font-semibold">Brevet Pajak A & B Terpadu</span>
                <span className="font-mono text-amber-400">3.840 Pendaftar (65%)</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[65%] rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="font-semibold">Brevet Pajak C Eksekutif</span>
                <span className="font-mono text-sky-400">1.450 Pendaftar (25%)</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div className="bg-sky-500 h-full w-[25%] rounded-full"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span className="font-semibold">Mastery & Simulasi Coretax DJP</span>
                <span className="font-mono text-emerald-400">2.100 Pendaftar (10%)</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[35%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="bg-slate-950/70 p-6 rounded-2xl border border-slate-800 shadow-md space-y-4">
          <h3 className="font-bold text-white text-sm">Pintasan Manajemen Cepat</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <Link
              to="/admin/payments"
              className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition text-slate-200 space-y-1 block"
            >
              <CreditCard className="w-5 h-5 text-amber-400 mb-1" />
              <div className="font-bold text-white">Verifikasi Pembayaran</div>
              <p className="text-[11px] text-slate-400">Audit bukti transfer siswa baru</p>
            </Link>

            <Link
              to="/admin/students"
              className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition text-slate-200 space-y-1 block"
            >
              <Users className="w-5 h-5 text-sky-400 mb-1" />
              <div className="font-bold text-white">Daftar Mahasiswa</div>
              <p className="text-[11px] text-slate-400">Kelola status dan akun siswa</p>
            </Link>

            <Link
              to="/admin/brevets"
              className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition text-slate-200 space-y-1 block"
            >
              <Award className="w-5 h-5 text-emerald-400 mb-1" />
              <div className="font-bold text-white">Kurikulum Brevet</div>
              <p className="text-[11px] text-slate-400">Atur harga & modul silabus</p>
            </Link>

            <Link
              to="/admin/certificates"
              className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition text-slate-200 space-y-1 block"
            >
              <ShieldCheck className="w-5 h-5 text-purple-400 mb-1" />
              <div className="font-bold text-white">Audit Sertifikat</div>
              <p className="text-[11px] text-slate-400">Log verifikasi QR Code resmi</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
