import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/quiz-session — Mulai atau resume quiz session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pesertaId } = body;

    if (!pesertaId || typeof pesertaId !== "number") {
      return NextResponse.json(
        { error: "pesertaId wajib diisi dan harus berupa angka" },
        { status: 400 }
      );
    }

    // Cek apakah peserta ada
    const peserta = await prisma.peserta.findUnique({
      where: { id: pesertaId },
    });

    if (!peserta) {
      return NextResponse.json(
        { error: "Peserta tidak ditemukan" },
        { status: 404 }
      );
    }

    // Cek apakah ada session in_progress (resume)
    const existingSession = await prisma.quizSession.findFirst({
      where: {
        pesertaId,
        status: "in_progress",
      },
    });

    if (existingSession) {
      // Resume: ambil soal-soal dari session yang sudah ada
      const soalIds: number[] = JSON.parse(existingSession.soalIds);
      const soalList = await prisma.soal.findMany({
        where: { id: { in: soalIds } },
      });

      // Urutkan sesuai urutan asli yang tersimpan
      const sortedSoalList = soalIds
        .map((id) => soalList.find((s) => s.id === id))
        .filter((s): s is typeof soalList[0] => s !== undefined)
        .map(({ jawabanBenar: _, ...rest }) => rest);

      // Baca durasi dari pengaturan (untuk keperluan timer)
      const pengaturan = await prisma.pengaturan.findUnique({
        where: { key: "durasi_menit" },
      });
      const durasiMenit = parseInt(pengaturan?.value || "15", 10);

      return NextResponse.json({
        quizSessionId: existingSession.id,
        soalList: sortedSoalList,
        durasiMenit,
      });
    }

    // Buat session baru
    // Baca pengaturan
    const [jumlahSetting, acakSetting, durasiSetting] = await Promise.all([
      prisma.pengaturan.findUnique({ where: { key: "jumlah_soal" } }),
      prisma.pengaturan.findUnique({ where: { key: "acak_soal" } }),
      prisma.pengaturan.findUnique({ where: { key: "durasi_menit" } }),
    ]);

    const jumlahSoal = parseInt(jumlahSetting?.value || "10", 10);
    const acakSoal = acakSetting?.value === "true";
    const durasiMenit = parseInt(durasiSetting?.value || "15", 10);

    // Ambil soal
    const allSoal = await prisma.soal.findMany({
      orderBy: { urutan: "asc" },
    });

    // Jika acak, shuffle array
    if (acakSoal) {
      for (let i = allSoal.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allSoal[i], allSoal[j]] = [allSoal[j], allSoal[i]];
      }
    }

    // Ambil sejumlah jumlahSoal (atau semua jika kurang)
    const selectedSoal = allSoal.slice(0, Math.min(jumlahSoal, allSoal.length));

    if (selectedSoal.length === 0) {
      return NextResponse.json(
        { error: "Belum ada soal tersedia. Hubungi admin." },
        { status: 400 }
      );
    }

    const soalIds = selectedSoal.map((s) => s.id);

    // Buat session
    const session = await prisma.quizSession.create({
      data: {
        pesertaId,
        status: "in_progress",
        jawaban: "{}",
        soalIds: JSON.stringify(soalIds),
      },
    });

    // Response tanpa jawabanBenar
    const soalPublik = selectedSoal.map(({ jawabanBenar: _, ...rest }) => rest);

    return NextResponse.json(
      {
        quizSessionId: session.id,
        soalList: soalPublik,
        durasiMenit,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating quiz session:", error);
    return NextResponse.json(
      { error: "Gagal memulai quiz" },
      { status: 500 }
    );
  }
}