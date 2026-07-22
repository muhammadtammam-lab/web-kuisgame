"use client";

import { useEffect, useState } from "react";
import { Card } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { formatDurasi } from "@/shared/utils/formatDurasi";
import type { LeaderboardEntry } from "@/types/quiz";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchLeaderboard() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/leaderboard");
      if (!res.ok) throw new Error("Gagal memuat leaderboard");
      setEntries(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/leaderboard");
        if (!res.ok) throw new Error("Gagal memuat leaderboard");
        const data = await res.json();
        if (!cancelled) setEntries(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function getRankStyle(rank: number) {
    if (rank === 1) return "bg-yellow-400 text-yellow-900"; // Gold
    if (rank === 2) return "bg-gray-300 text-gray-700";     // Silver
    if (rank === 3) return "bg-orange-300 text-orange-800"; // Bronze
    return "bg-blue-100 text-blue-700";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Papan Peringkat
          </h1>
          <p className="text-blue-200">
            Peserta dengan nilai tertinggi
          </p>
        </div>

        {isLoading && entries.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : error ? (
          <Card className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="secondary" onClick={fetchLeaderboard}>
              Coba Lagi
            </Button>
          </Card>
        ) : entries.length === 0 ? (
          <Card className="text-center">
            <p className="text-gray-500">Belum ada peserta yang menyelesaikan quiz.</p>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {entries.map((entry) => (
                <Card key={`${entry.rank}-${entry.nama}`} padding="sm">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${getRankStyle(entry.rank)}`}
                    >
                      {entry.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {entry.nama}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {entry.instansi}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold text-blue-900">
                        {entry.nilai}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDurasi(entry.durasiDetik)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Button
                variant="secondary"
                onClick={fetchLeaderboard}
                isLoading={isLoading}
              >
                Refresh
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}