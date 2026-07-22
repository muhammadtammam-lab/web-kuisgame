import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session";

// GET /api/materi — List semua materi, order by urutan asc (PUBLIK)
export async function GET() {
  try {
    const materiList = await prisma.materi.findMany({
      orderBy: { urutan: "asc" },
    });
    return NextResponse.json(materiList);
  } catch (error) {
    console.error("Error fetching materi:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data materi" },
      { status: 500 }
    );
  }
}

// POST /api/materi — Create materi baru (ADMIN ONLY)
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { judul, konten, gambarUrl, videoUrl, urutan } = body;

    // Validasi field wajib
    if (!judul || typeof judul !== "string" || judul.trim() === "") {
      return NextResponse.json(
        { error: "Judul materi wajib diisi" },
        { status: 400 }
      );
    }
    if (!konten || typeof konten !== "string" || konten.trim() === "") {
      return NextResponse.json(
        { error: "Konten materi wajib diisi" },
        { status: 400 }
      );
    }

    const materi = await prisma.materi.create({
      data: {
        judul: judul.trim(),
        konten: konten.trim(),
        gambarUrl: gambarUrl || null,
        videoUrl: videoUrl || null,
        urutan: typeof urutan === "number" ? urutan : 0,
      },
    });

    return NextResponse.json(materi, { status: 201 });
  } catch (error) {
    console.error("Error creating materi:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan materi" },
      { status: 500 }
    );
  }
}