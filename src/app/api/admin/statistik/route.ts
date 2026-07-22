import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const [totalPeserta, quizSelesai, totalSoal, aggr] = await Promise.all([
      prisma.peserta.count(),
      prisma.quizSession.count({ where: { status: "selesai" } }),
      prisma.soal.count(),
      prisma.quizSession.aggregate({
        _avg: { nilaiAkhir: true },
        where: { status: "selesai" },
      }),
    ]);

    return NextResponse.json({
      totalPeserta,
      quizSelesai,
      totalSoal,
      rataRataNilai: Math.round(aggr._avg.nilaiAkhir || 0),
    });
  } catch (error) {
    console.error("Error fetching statistik:", error);
    return NextResponse.json(
      { error: "Gagal mengambil statistik" },
      { status: 500 }
    );
  }
}