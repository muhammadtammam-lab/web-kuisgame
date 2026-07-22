/**
 * Script untuk membuat akun admin awal.
 * Jalankan: npx tsx src/lib/seed-admin.ts
 * 
 * INSTRUKSI:
 * 1. Ganti username & password default SEBELUM dipakai di production!
 * 2. Jalankan hanya SEKALI (ada proteksi duplicate)
 */
import prisma from "./prisma";
import bcrypt from "bcryptjs";

async function main() {
  const username = "admin";
  const password = "admin123"; // GANTI sebelum production!

  // Cek apakah admin sudah ada
  const existing = await prisma.admin.findUnique({
    where: { username },
  });

  if (existing) {
    console.log(`⚠️  Admin "${username}" sudah ada, skip seed.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.admin.create({
    data: {
      username,
      password: hashedPassword,
    },
  });

  console.log(`✅ Admin "${username}" berhasil dibuat.`);
  console.log(`⚠️  JANGAN LUPA ganti password sebelum production!`);
}

main()
  .catch((e) => {
    console.error("❌ Gagal seed admin:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());