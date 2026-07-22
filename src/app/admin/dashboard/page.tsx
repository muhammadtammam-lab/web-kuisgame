"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/shared/components/AdminLayout";
import { Card } from "@/shared/components/Card";

interface Statistik {
  totalPeserta: number;
  quizSelesai: number;
  totalSoal: number;
  rataRataNilai: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Statistik | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/statistik");
        if (!res.ok) throw new Error("Gagal memuat statistik");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {isLoading && (
        <div className="flex items-center gap-2 text-gray-500">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Memuat data...
        </div>
      )}

      {error && (
        <Card className="text-red-600">
          {error}
        </Card>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <p className="text-sm text-gray-500 mb-1">Total Peserta</p>
            <p className="text-3xl font-bold text-blue-900">{stats.totalPeserta}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500 mb-1">Quiz Selesai</p>
            <p className="text-3xl font-bold text-green-700">{stats.quizSelesai}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500 mb-1">Total Soal</p>
            <p className="text-3xl font-bold text-purple-700">{stats.totalSoal}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500 mb-1">Rata-rata Nilai</p>
            <p className="text-3xl font-bold text-orange-700">{stats.rataRataNilai}</p>
          </Card>
        </div>
      )}
    </AdminLayout>
  );
}