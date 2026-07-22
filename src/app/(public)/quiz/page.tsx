"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/components/Card";
import { Button } from "@/shared/components/Button";
import { formatDurasi } from "@/shared/utils/formatDurasi";
import type { SoalPublik } from "@/types/quiz";

interface QuizState {
  quizSessionId: number;
  soalList: SoalPublik[];
  durasiMenit: number;
}

const AUTO_NEXT_DELAY = 400; // ms

export default function QuizPage() {
  const router = useRouter();
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [jawabanTerpilih, setJawabanTerpilih] = useState<Record<number, string>>({});
  const [sisaWaktuDetik, setSisaWaktuDetik] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutoNext, setIsAutoNext] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoNextRef = useRef<NodeJS.Timeout | null>(null);

  // Init quiz session
  useEffect(() => {
    async function initQuiz() {
      const pesertaIdStr = sessionStorage.getItem("pesertaId");
      if (!pesertaIdStr) {
        router.replace("/daftar");
        return;
      }

      const pesertaId = parseInt(pesertaIdStr, 10);
      if (isNaN(pesertaId)) {
        router.replace("/daftar");
        return;
      }

      try {
        const res = await fetch("/api/quiz-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pesertaId }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Gagal memulai quiz");
        }

        const data: QuizState = await res.json();
        setQuizState(data);
        setSisaWaktuDetik(data.durasiMenit * 60);
        sessionStorage.setItem("quizSessionId", String(data.quizSessionId));

        // Load existing answers if resuming
        if (data.soalList.length > 0) {
          // Try to find a question that hasn't been answered
          // Jawaban akan dimuat ulang dari server nanti
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Terjadi kesalahan"
        );
      } finally {
        setIsLoading(false);
      }
    }

    initQuiz();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoNextRef.current) clearTimeout(autoNextRef.current);
    };
  }, [router]);

  // Timer countdown
  useEffect(() => {
    if (sisaWaktuDetik === null || isSubmitting) return;

    timerRef.current = setInterval(() => {
      setSisaWaktuDetik((prev) => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          // Auto submit saat waktu habis
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sisaWaktuDetik, isSubmitting]);

  // Auto save jawaban (fire and forget)
  const autoSave = useCallback(
    (soalId: number, jawaban: string) => {
      if (!quizState) return;

      fetch(`/api/quiz-session/${quizState.quizSessionId}/jawaban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soalId, jawaban }),
      }).catch(() => {
        // Silent fail — jangan ganggu UX untuk auto-save
      });
    },
    [quizState]
  );

  function pilihJawaban(soalId: number, jawaban: string) {
    if (isSubmitting || isAutoNext) return;

    // Set jawaban
    setJawabanTerpilih((prev) => ({ ...prev, [soalId]: jawaban }));

    // Auto-save
    autoSave(soalId, jawaban);

    // Auto-next (kecuali soal terakhir)
    if (quizState && currentIndex < quizState.soalList.length - 1) {
      setIsAutoNext(true);
      autoNextRef.current = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsAutoNext(false);
      }, AUTO_NEXT_DELAY);
    }
  }

  async function handleSubmit() {
    if (!quizState || isSubmitting) return;

    setIsSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoNextRef.current) clearTimeout(autoNextRef.current);

    try {
      const res = await fetch(
        `/api/quiz-session/${quizState.quizSessionId}/submit`,
        { method: "POST" }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal submit quiz");
      }

      router.push("/hasil");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal submit quiz"
      );
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-white/80 text-sm">Menyiapkan quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-800">
        <Card className="max-w-md text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => window.location.reload()}>
              Coba Lagi
            </Button>
            <Button variant="primary" onClick={() => router.push("/")}>
              Kembali ke Awal
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!quizState || quizState.soalList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-800">
        <Card className="max-w-md text-center">
          <p className="text-gray-600 mb-4">Tidak ada soal tersedia.</p>
          <Button variant="primary" onClick={() => router.push("/")}>
            Kembali
          </Button>
        </Card>
      </div>
    );
  }

  const currentSoal = quizState.soalList[currentIndex];
  const totalSoal = quizState.soalList.length;
  const progress = ((currentIndex + 1) / totalSoal) * 100;
  const isLastSoal = currentIndex === totalSoal - 1;
  const allAnswered = Object.keys(jawabanTerpilih).length === totalSoal;
  const timerWarning = sisaWaktuDetik !== null && sisaWaktuDetik < 60;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 py-6 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header: Progress Bar & Timer */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 mr-4">
            <div className="flex justify-between text-white/80 text-sm mb-1">
              <span>
                Soal {currentIndex + 1} dari {totalSoal}
              </span>
            </div>
            <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div
            className={`text-lg font-bold tabular-nums whitespace-nowrap ${
              timerWarning ? "text-red-300 animate-pulse" : "text-white"
            }`}
            aria-live="polite"
            aria-label={`Sisa waktu: ${sisaWaktuDetik !== null ? formatDurasi(sisaWaktuDetik) : "..."}`}
          >
            {sisaWaktuDetik !== null ? formatDurasi(sisaWaktuDetik) : "..."}
          </div>
        </div>

        {/* Soal Card */}
        <Card padding="lg" className="mb-4">
          <p className="text-sm text-blue-600 font-medium mb-2">
            Pertanyaan {currentIndex + 1}
          </p>
          <h2 className="text-lg font-semibold text-gray-900 mb-6 leading-relaxed">
            {currentSoal.pertanyaan}
          </h2>

          <div className="space-y-3">
            {(
              [
                { key: "A", value: currentSoal.pilihanA },
                { key: "B", value: currentSoal.pilihanB },
                { key: "C", value: currentSoal.pilihanC },
                { key: "D", value: currentSoal.pilihanD },
              ] as const
            ).map(({ key, value }) => {
              const isSelected = jawabanTerpilih[currentSoal.id] === key;
              return (
                <button
                  key={key}
                  onClick={() => pilihJawaban(currentSoal.id, key)}
                  disabled={isSubmitting || isAutoNext}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                  } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  aria-label={`Pilihan ${key}: ${value}`}
                >
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isSelected
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {key}
                  </span>
                  <span className="text-gray-700 font-medium flex-1">
                    {value}
                  </span>
                  {isSelected && (
                    <svg
                      className="w-5 h-5 text-blue-500 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setCurrentIndex((prev) => Math.max(0, prev - 1))
            }
            disabled={currentIndex === 0 || isSubmitting}
          >
            Sebelumnya
          </Button>

          <div className="flex gap-2">
            {isLastSoal ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={!allAnswered && !timerWarning}
              >
                {isSubmitting ? "Menyimpan..." : "Selesai"}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  setCurrentIndex((prev) =>
                    Math.min(totalSoal - 1, prev + 1)
                  )
                }
                disabled={currentIndex === totalSoal - 1 || isSubmitting}
              >
                Selanjutnya
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}