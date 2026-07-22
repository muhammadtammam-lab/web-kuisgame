"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { formatDurasi } from "@/shared/utils/formatDurasi";
import type { QuizResult } from "@/types/quiz";

export default function HasilPage() {
  const router = useRouter();
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResult() {
      const quizSessionId = sessionStorage.getItem("quizSessionId");
      if (!quizSessionId) {
        router.replace("/");
        return;
      }

      try {
        const res = await fetch(`/api/quiz-session/${quizSessionId}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Gagal memuat hasil");
        }
        const data: QuizResult = await res.json();
        setResult(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Terjadi kesalahan"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchResult();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/80 text-sm">Memuat hasil...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-800">
        <Card className="max-w-md text-center">
          <p className="text-red-600 mb-4">{error || "Data tidak ditemukan"}</p>
          <Button variant="primary" onClick={() => router.push("/")}>
            Kembali ke Awal
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Quiz Selesai!
          </h1>
          <p className="text-blue-200">
            Berikut hasil pengerjaan quiz Anda
          </p>
        </div>

        <Card padding="lg" className="text-center mb-6">
          {/* Nilai Utama */}
          <div className="mb-6">
            <div className="text-6xl font-bold text-blue-900 mb-2">
              {result.nilaiAkhir}
            </div>
            <p className="text-gray-500 font-medium">Nilai Akhir</p>
          </div>

          {/* Statistik Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-700">
                {result.jumlahBenar}
              </div>
              <div className="text-sm text-green-600">Benar</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-red-700">
                {result.jumlahSalah}
              </div>
              <div className="text-sm text-red-600">Salah</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-700">
                {result.totalSoal}
              </div>
              <div className="text-sm text-blue-600">Total Soal</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-purple-700">
                {formatDurasi(result.durasiPengerjaanDetik)}
              </div>
              <div className="text-sm text-purple-600">Waktu</div>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-3">
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => router.push("/leaderboard")}
          >
            Lihat Leaderboard
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => router.push("/")}
          >
            Kembali ke Awal
          </Button>
        </div>
      </div>
    </div>
  );
}