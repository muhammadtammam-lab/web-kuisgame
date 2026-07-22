# Dokumentasi Arsitektur — Gema Akuntabilitas Quiz App

## 1. Kenapa Single Next.js App (Bukan Backend Terpisah)?

**Keputusan**: Menggunakan satu aplikasi Next.js dengan API Routes, bukan backend Laravel terpisah seperti di roadmap master.

**Alasan**:
- **Deployment sederhana**: Satu repo, satu deploy ke Vercel, satu domain. Tidak perlu setup 2 server, 2 domain, atau reverse proxy.
- **Tidak ada CORS issues**: Frontend dan API satu origin, tidak perlu setup CORS headers.
- **Lebih cepat untuk solo developer**: Tidak perlu switching context antara 2 codebase berbeda.
- **Portofolio yang fokus**: Recruiter melihat satu proyek utuh, bukan dua proyek terpisah.

**Trade-off**:
- Tidak bisa scale backend secara independen dari frontend.
- Jika traffic sangat besar (ribuan request/detik), API Routes dalam Next.js bisa jadi bottleneck.
- Untuk event nyata dengan >500 peserta serentak, arsitektur terpisah (Laravel + VPS) lebih disarankan.

## 2. Kenapa Skor Dihitung Server-Side?

**Keputusan**: Semua perhitungan skor dilakukan 100% di server saat submit, bukan di client.

**Alasan**:
- **Mencegah kecurangan**: Jawaban benar (`jawabanBenar`) tidak pernah dikirim ke browser client. Yang dikirim hanya soal tanpa jawaban.
- **Integritas data**: Skor tidak bisa dimanipulasi via browser DevTools atau network inspection.
- **Source of truth**: Database adalah satu-satunya tempat yang menyimpan jawaban benar.

**Cara kerja**:
1. Client mengirim jawaban via PATCH `/api/quiz-session/[id]/jawaban` (auto-save, tanpa perhitungan).
2. Saat submit, server mengambil soal LENGKAP dengan `jawabanBenar` dari database.
3. Server membandingkan jawaban tersimpan vs jawaban benar, menghitung skor.
4. Client hanya menerima hasil akhir (nilai, jumlah benar/salah), bukan jawaban benar.

## 3. Kenapa Session Cookie Sederhana (Bukan NextAuth.js)?

**Keputusan**: Menggunakan JWT session cookie manual, bukan NextAuth.js atau library auth lainnya.

**Alasan**:
- **Kebutuhan minimal**: Hanya butuh 1 akun admin/panitia. Tidak perlu OAuth, Google login, atau multiple providers.
- **Kompleksitas lebih rendah**: NextAuth.js membutuhkan setup tabel database tambahan, callback URLs, dan konfigurasi yang lebih kompleks.
- **Kontrol penuh**: Dengan JWT manual, kita kontrol penuh format token, masa berlaku (8 jam), dan cookie options.

**Keamanan**:
- Cookie `httpOnly` — tidak bisa diakses via JavaScript client.
- `secure: true` di production — hanya dikirim via HTTPS.
- `sameSite: lax` — melindungi dari CSRF.
- Secret key minimal 32 karakter, disimpan di environment variable.

## 4. Bagaimana Auto-Save & Resume Bekerja?

**Auto-Save**:
- Setiap kali peserta memilih jawaban, client mengirim PATCH request ke `/api/quiz-session/[id]/jawaban`.
- Request bersifat "fire and forget" — tidak blocking UI, tidak menunggu response.
- Jawaban di-merge ke JSON object yang sudah ada (tidak replace seluruhnya).

**Resume**:
- Saat peserta membuka `/quiz`, sistem cek apakah ada session dengan status `in_progress`.
- Jika ada, session tersebut dikembalikan beserta daftar soal yang sudah dipilih sebelumnya.
- Jawaban yang sudah tersimpan di server tetap utuh.
- Timer di-reset berdasarkan `durasi_menit` dari pengaturan (bukan sisa waktu sebelumnya).

**Edge case**: Jika peserta submit 2x, endpoint submit akan menolak dengan status 400 karena session sudah berstatus `selesai`.

## 5. Database Design Notes

**SQLite untuk Development**: Memudahkan setup lokal tanpa perlu database eksternal. Cukup `npx prisma db push`.

**PostgreSQL untuk Production**: Menggunakan managed database (Neon/Supabase) agar tidak perlu mengelola server database sendiri.

**Model QuizSession**:
- `jawaban` disimpan sebagai JSON string (`{ "soalId": "A" }`) — cukup untuk skala kecil.
- `soalIds` disimpan sebagai JSON string array — untuk mengetahui soal mana yang dipilih saat session dibuat.
- Status `in_progress` vs `selesai` — untuk mendukung fitur resume dan mencegah double submit.

## 6. Tech Stack Rationale

| Layer | Pilihan | Alternatif | Alasan |
|---|---|---|---|
| Framework | Next.js 15 | Laravel, Django | Full-stack JS, satu app |
| Database | PostgreSQL (SQLite dev) | MySQL, MongoDB | Relational, cocok untuk data terstruktur |
| ORM | Prisma | Drizzle, TypeORM | Type-safe, migration mudah, dokumentasi baik |
| Styling | Tailwind CSS | Bootstrap, Chakra | Cepat, utility-first, mudah dikustomisasi |
| Auth | JWT + bcrypt | NextAuth, Lucia | Sederhana, cukup untuk 1 admin |
| Deployment | Vercel | Railway, Fly.io | Gratis, auto-HTTPS, auto-deploy dari Git |