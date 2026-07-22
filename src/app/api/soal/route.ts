import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session";

// GET /api/soal — List soal
// Query param: ?admin=true — jika ada, jawabanBenar ikut dikirim (untuk admin)
// Tanpa query param — jawabanBenar di-strip (untuk publik)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true";

    // Jika admin, cek session
    if (isAdmin) {
      const session = await getSessionFromCookies();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const soalList = await prisma.soal.findMany({
      orderBy: { urutan: "asc" },
    });

    if (isAdmin) {
      // Admin: kirim semua field termasuk jawabanBenar
      return NextResponse.json(soalList);
    }

    // Publik: strip jawabanBenar dari response
    const soalPublik = soalList.map(({ jawabanBenar, ...rest }) => rest);
    return NextResponse.json(soalPublik);
  } catch (error) {
    console.error("Error fetching soal:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data soal" },
      { status: 500 }
    );
  }
}

// POST /api/soal — Create soal baru (ADMIN ONLY)
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { pertanyaan, pilihanA, pilihanB, pilihanC, pilihanD, jawabanBenar, urutan } = body;

    // Validasi field wajib
    const errors: string[] = [];
    if (!pertanyaan || typeof pertanyaan !== "string" || pertanyaan.trim() === "") {
      errors.push("Pertanyaan wajib diisi");
    }
    if (!pilihanA || typeof pilihanA !== "string" || pilihanA.trim() === "") {
      errors.push("Pilihan A wajib diisi");
    }
    if (!pilihanB || typeof pilihanB !== "string" || pilihanB.trim() === "") {
      errors.push("Pilihan B wajib diisi");
    }
    if (!pilihanC || typeof pilihanC !== "string" || pilihanC.trim() === "") {
      errors.push("Pilihan C wajib diisi");
    }
    if (!pilihanD || typeof pilihanD !== "string" || pilihanD.trim() === "") {
      errors.push("Pilihan D wajib diisi");
    }
    if (!jawabanBenar || !["A", "B", "C", "D"].includes(jawabanBenar)) {
      errors.push("Jawaban benar harus A, B, C, atau D");
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join(". ") },
        { status: 400 }
      );
    }

    const soal = await prisma.soal.create({
      data: {
        pertanyaan: pertanyaan.trim(),
        pilihanA: pilihanA.trim(),
        pilihanB: pilihanB.trim(),
        pilihanC: pilihanC.trim(),
        pilihanD: pilihanD.trim(),
        jawabanBenar,
        urutan: typeof urutan === "number" ? urutan : 0,
      },
    });

    return NextResponse.json(soal, { status: 201 });
  } catch (error) {
    console.error("Error creating soal:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan soal" },
      { status: 500 }
    );
  }
}