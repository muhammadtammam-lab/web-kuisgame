import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/peserta — Daftar peserta baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nama, instansi, email, noHp } = body;

    // Validasi field wajib
    if (!nama || typeof nama !== "string" || nama.trim() === "") {
      return NextResponse.json(
        { error: "Nama wajib diisi" },
        { status: 400 }
      );
    }
    if (!instansi || typeof instansi !== "string" || instansi.trim() === "") {
      return NextResponse.json(
        { error: "Instansi wajib diisi" },
        { status: 400 }
      );
    }

    const peserta = await prisma.peserta.create({
      data: {
        nama: nama.trim(),
        instansi: instansi.trim(),
        email: email || null,
        noHp: noHp || null,
      },
    });

    return NextResponse.json(
      { pesertaId: peserta.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating peserta:", error);
    return NextResponse.json(
      { error: "Gagal mendaftarkan peserta" },
      { status: 500 }
    );
  }
}