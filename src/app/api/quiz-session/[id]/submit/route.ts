import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = Promise<{ id: string }>;

// POST /api/quiz-session/[id]/submit — Submit quiz & hitung skor server-side
export async function POST(request: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id, 10);

    if (isNaN(sessionId)) {
      return NextResponse.json(
        { error: "ID session tidak valid" },
        { status: 400 }
      );
    }

    // Ambil session
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Sesi quiz tidak ditemukan" },
        { status: 404 }
      );
    }

    if (session.status === "selesai") {
      return NextResponse.json(
        { error: "Sesi sudah pernah disubmit, tidak bisa disubmit ulang" },
        { status: 400 }
      );
    }

    // Ambil soal-soal yang relevan LENGKAP dengan jawabanBenar dari DB
    const soalIds: number[] = JSON.parse(session.soalIds);
    const soalList = await prisma.soal.findMany({
      where: { id: { in: soalIds } },
    });

    // Urutkan sesuai urutan asli
    const sortedSoal = soalIds
      .map((id) => soalList.find((s) => s.id === id))
      .filter(Boolean) as typeof soalList;

    // Ambil jawaban peserta
    const jawabanPeserta: Record<string, string> = JSON.parse(session.jawaban);

    // Hitung skor
    let jumlahBenar = 0;
    let jumlahSalah = 0;

    for (const soal of sortedSoal) {
      const jawaban = jawabanPeserta[String(soal.id)];
      if (jawaban === soal.jawabanBenar) {
        jumlahBenar++;
      } else {
        jumlahSalah++;
      }
    }

    const totalSoal = sortedSoal.length;
    const nilaiAkhir = Math.round((jumlahBenar / totalSoal) * 100);

    // Hitung durasi pengerjaan
    const now = new Date();
    const durasiPengerjaanDetik = Math.round(
      (now.getTime() - session.startedAt.getTime()) / 1000
    );

    // Update session
    const updatedSession = await prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        status: "selesai",
        finishedAt: now,
        jumlahBenar,
        jumlahSalah,
        totalSoal,
        nilaiAkhir,
        durasiPengerjaanDetik,
      },
    });

    return NextResponse.json({
      quizSessionId: updatedSession.id,
      status: updatedSession.status,
      nilaiAkhir: updatedSession.nilaiAkhir,
      jumlahBenar: updatedSession.jumlahBenar,
      jumlahSalah: updatedSession.jumlahSalah,
      totalSoal: updatedSession.totalSoal,
      durasiPengerjaanDetik: updatedSession.durasiPengerjaanDetik,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Gagal submit quiz" },
      { status: 500 }
    );
  }
}