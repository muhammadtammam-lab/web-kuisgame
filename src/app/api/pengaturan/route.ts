import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/session";

const DEFAULT_SETTINGS: Record<string, string> = {
  jumlah_soal: "10",
  durasi_menit: "15",
  acak_soal: "true",
};

// GET /api/pengaturan — Ambil semua pengaturan sebagai object key-value
export async function GET() {
  try {
    let settings = await prisma.pengaturan.findMany();

    // Jika masih kosong, seed default
    if (settings.length === 0) {
      const created = await Promise.all(
        Object.entries(DEFAULT_SETTINGS).map(([key, value]) =>
          prisma.pengaturan.create({ data: { key, value } })
        )
      );
      settings = created;
    }

    // Transform array of {key, value} menjadi object { jumlah_soal: "10", ... }
    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching pengaturan:", error);
    return NextResponse.json(
      { error: "Gagal mengambil pengaturan" },
      { status: 500 }
    );
  }
}

// PUT /api/pengaturan — Update satu atau beberapa pengaturan (upsert) (ADMIN ONLY)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    // Validasi key yang diperbolehkan
    const allowedKeys = Object.keys(DEFAULT_SETTINGS);
    const errors: string[] = [];

    for (const [key, value] of Object.entries(body)) {
      if (!allowedKeys.includes(key)) {
        errors.push(`Key "${key}" tidak dikenal`);
        continue;
      }

      // Validasi value
      if (key === "jumlah_soal" || key === "durasi_menit") {
        const num = Number(value);
        if (!Number.isInteger(num) || num < 1 || num > 100) {
          errors.push(`${key} harus berupa angka antara 1-100`);
          continue;
        }
      }

      if (key === "acak_soal") {
        if (value !== "true" && value !== "false") {
          errors.push(`acak_soal harus "true" atau "false"`);
          continue;
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.join(". ") },
        { status: 400 }
      );
    }

    // Upsert setiap key
    const updated: Record<string, string> = {};
    for (const [key, value] of Object.entries(body)) {
      const v = String(value);
      await prisma.pengaturan.upsert({
        where: { key },
        update: { value: v },
        create: { key, value: v },
      });
      updated[key] = v;
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating pengaturan:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate pengaturan" },
      { status: 500 }
    );
  }
}