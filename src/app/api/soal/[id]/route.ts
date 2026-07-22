import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session";

type Params = Promise<{ id: string }>;

// GET /api/soal/[id] — Detail satu soal
export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params;
    const soalId = parseInt(id, 10);

    if (isNaN(soalId)) {
      return NextResponse.json(
        { error: "ID soal tidak valid" },
        { status: 400 }
      );
    }

    const soal = await prisma.soal.findUnique({
      where: { id: soalId },
    });

    if (!soal) {
      return NextResponse.json(
        { error: "Soal tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(soal);
  } catch (error) {
    console.error("Error fetching soal:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data soal" },
      { status: 500 }
    );
  }
}

// PUT /api/soal/[id] — Update soal (ADMIN ONLY)
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const soalId = parseInt(id, 10);

    if (isNaN(soalId)) {
      return NextResponse.json(
        { error: "ID soal tidak valid" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { pertanyaan, pilihanA, pilihanB, pilihanC, pilihanD, jawabanBenar, urutan } = body;

    // Validasi field jika dikirim
    if (pertanyaan !== undefined && (typeof pertanyaan !== "string" || pertanyaan.trim() === "")) {
      return NextResponse.json(
        { error: "Pertanyaan tidak boleh kosong" },
        { status: 400 }
      );
    }
    if (jawabanBenar !== undefined && !["A", "B", "C", "D"].includes(jawabanBenar)) {
      return NextResponse.json(
        { error: "Jawaban benar harus A, B, C, atau D" },
        { status: 400 }
      );
    }

    // Cek apakah soal exists
    const existing = await prisma.soal.findUnique({
      where: { id: soalId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Soal tidak ditemukan" },
        { status: 404 }
      );
    }

    const soal = await prisma.soal.update({
      where: { id: soalId },
      data: {
        ...(pertanyaan !== undefined && { pertanyaan: pertanyaan.trim() }),
        ...(pilihanA !== undefined && { pilihanA: pilihanA.trim() }),
        ...(pilihanB !== undefined && { pilihanB: pilihanB.trim() }),
        ...(pilihanC !== undefined && { pilihanC: pilihanC.trim() }),
        ...(pilihanD !== undefined && { pilihanD: pilihanD.trim() }),
        ...(jawabanBenar !== undefined && { jawabanBenar }),
        ...(urutan !== undefined && { urutan }),
      },
    });

    return NextResponse.json(soal);
  } catch (error) {
    console.error("Error updating soal:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate soal" },
      { status: 500 }
    );
  }
}

// DELETE /api/soal/[id] — Hapus soal (ADMIN ONLY)
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const soalId = parseInt(id, 10);

    if (isNaN(soalId)) {
      return NextResponse.json(
        { error: "ID soal tidak valid" },
        { status: 400 }
      );
    }

    const existing = await prisma.soal.findUnique({
      where: { id: soalId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Soal tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.soal.delete({
      where: { id: soalId },
    });

    return NextResponse.json({ message: "Soal berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting soal:", error);
    return NextResponse.json(
      { error: "Gagal menghapus soal" },
      { status: 500 }
    );
  }
}