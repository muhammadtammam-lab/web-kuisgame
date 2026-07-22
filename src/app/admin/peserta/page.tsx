"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/shared/components/AdminLayout";
import { Card } from "@/shared/components/Card";
import { formatDurasi } from "@/shared/utils/formatDurasi";

interface PesertaWithQuiz {
  id: number;
  nama: string;
  instansi: string;
  email: string | null;
  noHp: string | null;
  quizSessions: {
    id: number;
    status: string;
    nilaiAkhir: number | null;
    jumlahBenar: number | null;
    totalSoal: number | null;
    durasiPengerjaanDetik: number | null;
  }[];
}

type FilterStatus = "semua" | "selesai" | "in_progress";

export default function AdminPesertaPage() {
  const [pesertaList, setPesertaList] = useState<PesertaWithQuiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("semua");

  useEffect(() => {
    async function fetchPeserta() {
      try {
        const res = await fetch("/api/admin/peserta");
        if (!res.ok) throw new Error("Gagal memuat data peserta");
        setPesertaList(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setIsLoading(false);
      }
    }
    fetchPeserta();
  }, []);

  const filteredList = pesertaList.filter((p) => {
    if (filter === "semua") return true;
    const latestSession = p.quizSessions[p.quizSessions.length - 1];
    if (!latestSession) return filter === "in_progress";
    return latestSession.status === filter;
  });

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Peserta</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterStatus)}
          className="h-10 px-3 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option value="semua">Semua</option>
          <option value="selesai">Selesai</option>
          <option value="in_progress">Sedang Mengerjakan</option>
        </select>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : error ? (
        <Card className="text-red-600">{error}</Card>
      ) : filteredList.length === 0 ? (
        <Card><p className="text-gray-500">Tidak ada data peserta.</p></Card>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-500">
                <th className="py-3 px-4">Nama</th>
                <th className="py-3 px-4">Instansi</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Nilai</th>
                <th className="py-3 px-4">Durasi</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((p) => {
                const latestSession = p.quizSessions[p.quizSessions.length - 1];
                const isSelesai = latestSession?.status === "selesai";
                return (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{p.nama}</td>
                    <td className="py-3 px-4 text-gray-600">{p.instansi}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          isSelesai
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {isSelesai ? "Selesai" : "Sedang Mengerjakan"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold">
                      {isSelesai ? latestSession.nilaiAkhir : "-"}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {isSelesai && latestSession.durasiPengerjaanDetik
                        ? formatDurasi(latestSession.durasiPengerjaanDetik)
                        : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}