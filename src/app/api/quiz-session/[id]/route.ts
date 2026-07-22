import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = Promise<{ id: string }>;

// GET /api/quiz-session/[id] — Detail quiz session (untuk halaman hasil)
export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id, 10);

    if (isNaN(sessionId)) {
      return NextResponse.json(
        { error: "ID session tidak valid" },
        { status: 400 }
      );
    }

    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        status: true,
        nilaiAkhir: true,
        jumlahBenar: true,
        jumlahSalah: true,
        totalSoal: true,
        durasiPengerjaanDetik: true,
        startedAt: true,
        finishedAt: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Sesi quiz tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(session);
  } catch (error) {
    console.error("Error fetching quiz session:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data sesi quiz" },
      { status: 500 }
    );
  }
}