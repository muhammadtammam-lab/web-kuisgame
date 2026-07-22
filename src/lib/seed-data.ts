/**
 * Script untuk mengisi database dengan materi dan soal contoh.
 * Jalankan: .\node_modules\.bin\tsx src\lib\seed-data.ts
 * 
 * Menambahkan materi dan soal dari file Kuis Interaktif INCOSAI
 * tanpa menghapus data yang sudah ada.
 */
import prisma from "./prisma";

const materiData = [
  {
    judul: "Apa itu INTOSAI?",
    konten: `INTOSAI (International Organization of Supreme Audit Institutions) adalah organisasi internasional yang menaungi lembaga pemeriksa keuangan negara (Supreme Audit Institutions / SAI) di seluruh dunia.

Moto INTOSAI: "Mutual Experience Benefits All" — Pengalaman Bersama Memberikan Manfaat bagi Semua.

Tujuan utama INTOSAI adalah meningkatkan kerja sama dan kapasitas SAI di seluruh dunia melalui:
- Berbagi pengalaman dan praktik terbaik
- Menyusun standar pemeriksaan internasional (ISSAI)
- Memperkuat kerja sama antar lembaga pemeriksa

Anggota INTOSAI dari Indonesia adalah BPK RI (Badan Pemeriksa Keuangan Republik Indonesia).`,
    urutan: 1,
  },
  {
    judul: "Apa itu INCOSAI?",
    konten: `INCOSAI (International Congress of Supreme Audit Institutions) adalah kongres tiga tahunan yang diselenggarakan oleh INTOSAI.

INCOSAI merupakan forum tertinggi dalam struktur INTOSAI yang dihadiri oleh seluruh negara anggota untuk:
- Membahas isu-isu strategis dalam pemeriksaan keuangan negara
- Menyusun dan mengesahkan standar pemeriksaan internasional
- Berbagi pengalaman dan inovasi antar SAI
- Memperkuat jaringan kerja sama global

INCOSAI diselenggarakan setiap tiga tahun sekali (tiga tahunan) dan menjadi ajang penting bagi para auditor pemerintah dari seluruh dunia untuk bertukar pengetahuan dan pengalaman.`,
    urutan: 2,
  },
  {
    judul: "Manfaat Mengikuti INCOSAI",
    konten: `Mengikuti INCOSAI memberikan banyak manfaat, antara lain:

1. Berbagi pengalaman dan praktik terbaik dengan sesama auditor dari berbagai negara
2. Menyusun dan mengembangkan standar pemeriksaan internasional
3. Memperkuat kerja sama antar SAI (Supreme Audit Institutions)
4. Mendapatkan wawasan tentang inovasi terbaru dalam bidang audit sektor publik
5. Membangun jaringan profesional global

Penting untuk diketahui: Tidak semua negara anggota PBB otomatis menjadi anggota INTOSAI. Keanggotaan INTOSAI bersifat sukarela dan khusus untuk lembaga pemeriksa keuangan negara.`,
    urutan: 3,
  },
];

const soalData = [
  {
    pertanyaan: "INTOSAI merupakan singkatan dari...",
    pilihanA: "International Organization of Tax Audit Institutions",
    pilihanB: "International Organization of Supreme Audit Institutions",
    pilihanC: "International Office of State Audit Institutions",
    pilihanD: "International Organization of State Inspection",
    jawabanBenar: "B",
    urutan: 1,
  },
  {
    pertanyaan: "Apa tujuan utama INTOSAI?",
    pilihanA: "Menyusun anggaran negara",
    pilihanB: "Mengelola pajak internasional",
    pilihanC: "Meningkatkan kerja sama dan kapasitas Supreme Audit Institutions (SAI) di seluruh dunia",
    pilihanD: "Menetapkan kebijakan moneter dunia",
    jawabanBenar: "C",
    urutan: 2,
  },
  {
    pertanyaan: "INCOSAI adalah...",
    pilihanA: "Forum auditor internal dunia",
    pilihanB: "Pertemuan tahunan ASEANSAI",
    pilihanC: "Kongres tiga tahunan anggota INTOSAI",
    pilihanD: "Sidang Perserikatan Bangsa-Bangsa",
    jawabanBenar: "C",
    urutan: 3,
  },
  {
    pertanyaan: "Seberapa sering INCOSAI diselenggarakan?",
    pilihanA: "Setiap tahun",
    pilihanB: "Dua tahun sekali",
    pilihanC: "Tiga tahun sekali",
    pilihanD: "Lima tahun sekali",
    jawabanBenar: "C",
    urutan: 4,
  },
  {
    pertanyaan: "Siapakah anggota INTOSAI dari Indonesia?",
    pilihanA: "Kementerian Keuangan",
    pilihanB: "BPKP",
    pilihanC: "Inspektorat Jenderal",
    pilihanD: "BPK RI",
    jawabanBenar: "D",
    urutan: 5,
  },
  {
    pertanyaan: "Moto INTOSAI adalah...",
    pilihanA: "Audit for Better World",
    pilihanB: "Mutual Experience Benefits All",
    pilihanC: "Integrity Above All",
    pilihanD: "Excellence in Audit",
    jawabanBenar: "B",
    urutan: 6,
  },
  {
    pertanyaan: "Apa manfaat mengikuti INCOSAI?",
    pilihanA: "Berwisata ke luar negeri",
    pilihanB: "Berbagi pengalaman, menyusun standar, dan memperkuat kerja sama antar-SAI",
    pilihanC: "Menentukan APBN negara anggota",
    pilihanD: "Menentukan pejabat pemeriksa",
    jawabanBenar: "B",
    urutan: 7,
  },
  {
    pertanyaan: 'Benar atau Salah: "Semua negara anggota PBB otomatis menjadi anggota INTOSAI."',
    pilihanA: "Benar",
    pilihanB: "Salah",
    pilihanC: "Tidak ada jawaban yang tepat",
    pilihanD: "Hanya negara maju",
    jawabanBenar: "B",
    urutan: 8,
  },
  {
    pertanyaan: "Apa kepanjangan SAI?",
    pilihanA: "State Audit Inspection",
    pilihanB: "Supreme Accounting Institution",
    pilihanC: "Supreme Audit Institution",
    pilihanD: "State Auditor Institution",
    jawabanBenar: "C",
    urutan: 9,
  },
  {
    pertanyaan: "Bonus: Sebutkan moto INTOSAI dalam Bahasa Indonesia!",
    pilihanA: "Audit untuk Dunia yang Lebih Baik",
    pilihanB: "Pengalaman Bersama Memberikan Manfaat bagi Semua",
    pilihanC: "Integritas di Atas Segalanya",
    pilihanD: "Keunggulan dalam Pemeriksaan",
    jawabanBenar: "B",
    urutan: 10,
  },
];

async function main() {
  console.log("🌱 Seeding data materi dan soal...\n");

  // Seed Materi
  console.log("--- MATERI ---");
  for (const m of materiData) {
    const existing = await prisma.materi.findFirst({
      where: { judul: m.judul },
    });
    if (existing) {
      console.log(`⚠️  Materi "${m.judul}" sudah ada, skip.`);
      continue;
    }
    await prisma.materi.create({ data: m });
    console.log(`✅ Materi "${m.judul}" berhasil ditambahkan.`);
  }

  // Seed Soal
  console.log("\n--- SOAL ---");
  for (const s of soalData) {
    const existing = await prisma.soal.findFirst({
      where: { pertanyaan: s.pertanyaan },
    });
    if (existing) {
      console.log(`⚠️  Soal "${s.pertanyaan.substring(0, 50)}..." sudah ada, skip.`);
      continue;
    }
    await prisma.soal.create({ data: s });
    console.log(`✅ Soal "${s.pertanyaan.substring(0, 50)}..." berhasil ditambahkan.`);
  }

  console.log("\n🎉 Seeding selesai!");
  console.log(`   - ${materiData.length} materi ditambahkan`);
  console.log(`   - ${soalData.length} soal ditambahkan`);
  console.log("\n📋 Buka http://localhost:3000 untuk melihat materi");
  console.log("🔐 Buka http://localhost:3000/admin/login untuk admin panel");
}

main()
  .catch((e) => {
    console.error("❌ Gagal seeding:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());