"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import type { Materi } from "@/types/quiz";

export default function MateriPage() {
  const router = useRouter();
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [materiSelesai, setMateriSelesai] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMateri() {
      try {
        const res = await fetch("/api/materi");
        if (!res.ok) throw new Error("Gagal memuat materi");
        const data = await res.json();
        setMateriList(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Terjadi kesalahan"
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchMateri();
  }, []);

  function toggleSelesai(id: number) {
    setMateriSelesai((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const semuaSelesai = materiList.length > 0 && materiSelesai.size >= materiList.length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/80 text-sm">Memuat materi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-800">
        <Card className="max-w-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Coba Lagi
          </Button>
        </Card>
      </div>
    );
  }

  if (materiList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-800">
        <Card className="max-w-md text-center">
          <p className="text-gray-600">Belum ada materi tersedia.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">
          Materi Pembelajaran
        </h1>
        <p className="text-blue-200 text-center mb-8">
          Bacalah seluruh materi sebelum melanjutkan ke quiz.
        </p>

        <div className="space-y-6">
          {materiList.map((materi) => {
            const sudahDibaca = materiSelesai.has(materi.id);
            return (
              <Card key={materi.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-blue-900 mb-3">
                      {materi.judul}
                    </h2>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                      {materi.konten}
                    </div>

                    {materi.gambarUrl && (
                      <img
                        src={materi.gambarUrl}
                        alt={`Ilustrasi ${materi.judul}`}
                        className="mt-4 rounded-lg max-w-full h-auto"
                        loading="lazy"
                      />
                    )}

                    {materi.videoUrl && (
                      <div className="mt-4 aspect-video">
                        <iframe
                          src={materi.videoUrl.replace(
                            /(?:watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
                            "embed/$1"
                          )}
                          className="w-full h-full rounded-lg"
                          allowFullScreen
                          title={`Video ${materi.judul}`}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => toggleSelesai(materi.id)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      sudahDibaca
                        ? "text-green-600"
                        : "text-gray-500 hover:text-blue-600"
                    }`}
                    aria-label={
                      sudahDibaca
                        ? `Tandai "${materi.judul}" belum dibaca`
                        : `Tandai "${materi.judul}" sudah dibaca`
                    }
                  >
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        sudahDibaca
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-gray-300"
                      }`}
                    >
                      {sudahDibaca && (
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </span>
                    {sudahDibaca ? "Sudah Saya Baca" : "Tandai Sudah Dibaca"}
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="primary"
            size="lg"
            disabled={!semuaSelesai}
            onClick={() => router.push("/daftar")}
          >
            {semuaSelesai
              ? "Lanjut ke Pendaftaran"
              : `Baca semua materi (${materiSelesai.size}/${materiList.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
}