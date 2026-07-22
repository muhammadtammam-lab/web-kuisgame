import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session";

type Params = Promise<{ id: string }>;

// GET /api/materi/[id] — Detail satu materi
export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = await params;
    const materiId = parseInt(id, 10);

    if (isNaN(materiId)) {
      return NextResponse.json(
        { error: "ID materi tidak valid" },
        { status: 400 }
      );
    }

    const materi = await prisma.materi.findUnique({
      where: { id: materiId },
    });

    if (!materi) {
      return NextResponse.json(
        { error: "Materi tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(materi);
  } catch (error) {
    console.error("Error fetching materi:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data materi" },
      { status: 500 }
    );
  }
}

// PUT /api/materi/[id] — Update materi (ADMIN ONLY)
export async function PUT(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const materiId = parseInt(id, 10);

    if (isNaN(materiId)) {
      return NextResponse.json(
        { error: "ID materi tidak valid" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { judul, konten, gambarUrl, videoUrl, urutan } = body;

    // Validasi field wajib
    if (judul !== undefined && (typeof judul !== "string" || judul.trim() === "")) {
      return NextResponse.json(
        { error: "Judul materi tidak boleh kosong" },
        { status: 400 }
      );
    }
    if (konten !== undefined && (typeof konten !== "string" || konten.trim() === "")) {
      return NextResponse.json(
        { error: "Konten materi tidak boleh kosong" },
        { status: 400 }
      );
    }

    // Cek apakah materi exists
    const existing = await prisma.materi.findUnique({
      where: { id: materiId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Materi tidak ditemukan" },
        { status: 404 }
      );
    }

    const materi = await prisma.materi.update({
      where: { id: materiId },
      data: {
        ...(judul !== undefined && { judul: judul.trim() }),
        ...(konten !== undefined && { konten: konten.trim() }),
        ...(gambarUrl !== undefined && { gambarUrl: gambarUrl || null }),
        ...(videoUrl !== undefined && { videoUrl: videoUrl || null }),
        ...(urutan !== undefined && { urutan }),
      },
    });

    return NextResponse.json(materi);
  } catch (error) {
    console.error("Error updating materi:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate materi" },
      { status: 500 }
    );
  }
}

// DELETE /api/materi/[id] — Hapus materi (ADMIN ONLY)
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const materiId = parseInt(id, 10);

    if (isNaN(materiId)) {
      return NextResponse.json(
        { error: "ID materi tidak valid" },
        { status: 400 }
      );
    }

    const existing = await prisma.materi.findUnique({
      where: { id: materiId },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Materi tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.materi.delete({
      where: { id: materiId },
    });

    return NextResponse.json({ message: "Materi berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting materi:", error);
    return NextResponse.json(
      { error: "Gagal menghapus materi" },
      { status: 500 }
    );
  }
}