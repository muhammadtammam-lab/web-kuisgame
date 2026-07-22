import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = Promise<{ id: string }>;

// PATCH /api/quiz-session/[id]/jawaban — Auto-save satu jawaban (tidak hitung skor)
export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id, 10);

    if (isNaN(sessionId)) {
      return NextResponse.json(
        { error: "ID session tidak valid" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { soalId, jawaban } = body;

    if (!soalId || !jawaban || !["A", "B", "C", "D"].includes(jawaban)) {
      return NextResponse.json(
        { error: "soalId dan jawaban (A/B/C/D) wajib diisi" },
        { status: 400 }
      );
    }

    // Cek session
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
        { error: "Sesi sudah berakhir, tidak bisa mengubah jawaban" },
        { status: 400 }
      );
    }

    // Merge jawaban baru ke jawaban yang sudah ada
    const jawabanSaatIni = JSON.parse(session.jawaban);
    jawabanSaatIni[String(soalId)] = jawaban;

    await prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        jawaban: JSON.stringify(jawabanSaatIni),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving jawaban:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan jawaban" },
      { status: 500 }
    );
  }
}