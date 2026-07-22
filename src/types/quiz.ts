// TypeScript interfaces for Gema Akuntabilitas Quiz App

export interface Materi {
  id: number;
  judul: string;
  konten: string;
  gambarUrl: string | null;
  videoUrl: string | null;
  urutan: number;
  createdAt: string;
}

// Soal returned to public (without jawabanBenar)
export interface SoalPublik {
  id: number;
  pertanyaan: string;
  pilihanA: string;
  pilihanB: string;
  pilihanC: string;
  pilihanD: string;
  urutan: number;
}

// Soal for admin (with jawabanBenar)
export interface SoalAdmin extends SoalPublik {
  jawabanBenar: string;
}

export interface Peserta {
  id: number;
  nama: string;
  instansi: string;
  email: string | null;
  noHp: string | null;
  createdAt: string;
}

export interface QuizSession {
  id: number;
  pesertaId: number;
  status: "in_progress" | "selesai";
  nilaiAkhir: number | null;
  jumlahBenar: number | null;
  jumlahSalah: number | null;
  totalSoal: number | null;
  durasiPengerjaanDetik: number | null;
  startedAt: string;
  finishedAt: string | null;
}

export interface Pengaturan {
  jumlah_soal: string;
  durasi_menit: string;
  acak_soal: string;
}

export interface QuizSessionResponse {
  quizSessionId: number;
  soalList: SoalPublik[];
  durasiMenit: number;
}

export interface QuizResult {
  quizSessionId: number;
  status: string;
  nilaiAkhir: number;
  jumlahBenar: number;
  jumlahSalah: number;
  totalSoal: number;
  durasiPengerjaanDetik: number;
}

export interface LeaderboardEntry {
  rank: number;
  nama: string;
  instansi: string;
  nilai: number;
  durasiDetik: number;
}