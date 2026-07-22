import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const results = await prisma.quizSession.findMany({
      where: { status: "selesai" },
      include: {
        peserta: {
          select: { nama: true, instansi: true },
        },
      },
      orderBy: [
        { nilaiAkhir: "desc" },
        { durasiPengerjaanDetik: "asc" },
      ],
      take: 20,
    });

    const leaderboard = results.map((r, index) => ({
      rank: index + 1,
      nama: r.peserta.nama,
      instansi: r.peserta.instansi,
      nilai: r.nilaiAkhir,
      durasiDetik: r.durasiPengerjaanDetik,
    }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data leaderboard" },
      { status: 500 }
    );
  }
}