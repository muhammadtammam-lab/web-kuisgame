import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pesertaList = await prisma.peserta.findMany({
      include: {
        quizSessions: {
          select: {
            id: true,
            status: true,
            nilaiAkhir: true,
            jumlahBenar: true,
            totalSoal: true,
            durasiPengerjaanDetik: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(pesertaList);
  } catch (error) {
    console.error("Error fetching peserta:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data peserta" },
      { status: 500 }
    );
  }
}