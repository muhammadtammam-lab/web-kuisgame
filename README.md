# 🎯 Gema Akuntabilitas — Quiz Interaktif

Aplikasi quiz interaktif berbasis web untuk menguji pemahaman seputar akuntabilitas dalam konteks **BPK RI**, **INTOSAI**, dan **INCOSAI**. Dibangun sebagai proyek full-stack dengan arsitektur monolitik Next.js.

![Landing Page](https://via.placeholder.com/800x400/1e3a5f/ffffff?text=Screenshot+Landing+Page)
> *Screenshot akan muncul setelah logo diupload*

---

## 📋 Daftar Isi
- [Fitur](#fitur)
- [Tech Stack](#tech-stack)
- [Cara Menjalankan](#cara-menjalankan-lokal)
- [Struktur Folder](#struktur-folder)
- [Upload Logo](#upload-logo)
- [Akun Admin](#akun-admin)
- [API Endpoints](#api-endpoints)
- [Keputusan Arsitektur](#keputusan-arsitektur)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## ✨ Fitur

### 🔵 Halaman Publik
| Fitur | Deskripsi |
|-------|-----------|
| **Landing Page** | Hero section dengan 3 logo institusi + CTA "Mulai" |
| **Materi Edukasi** | Konten pembelajaran, **wajib selesai** sebelum quiz aktif |
| **Form Data Diri** | Nama & instansi wajib, email & no HP opsional |
| **Quiz Engine** | Timer countdown, auto-save per jawaban, auto-next |
| **Skor Server-Side** | Jawaban benar **tidak pernah** dikirim ke browser |
| **Resume Session** | Refresh browser → lanjut dari soal terakhir |
| **Halaman Hasil** | Nilai, statistik benar/salah, waktu pengerjaan |
| **Leaderboard** | Peringkat berdasarkan nilai (gold/silver/bronze) |

### 🟢 Halaman Admin
| Fitur | Deskripsi |
|-------|-----------|
| **Login** | Session cookie httpOnly + bcrypt |
| **Dashboard** | Statistik: total peserta, quiz selesai, rata-rata nilai |
| **CRUD Materi** | Tambah, edit, hapus materi edukasi |
| **CRUD Soal** | Tambah, edit, hapus soal + pilih jawaban benar |
| **Data Peserta** | Tabel peserta + filter status & nilai |
| **Pengaturan Sistem** | Jumlah soal, durasi, acak soal |
| **QR Code Generator** | Generate + download QR untuk landing page |

---

## 🛠 Tech Stack

| Layer | Teknologi | Alasan |
|-------|-----------|--------|
| **Framework** | Next.js 15 (App Router, TypeScript) | Full-stack dalam 1 app |
| **Styling** | Tailwind CSS 4 | Cepat, utility-first |
| **Database** | SQLite (dev) / PostgreSQL (prod) | Prisma ORM |
| **ORM** | Prisma 6 | Type-safe, migration mudah |
| **Auth Admin** | JWT + bcrypt | Sederhana, cukup 1 akun |
| **Animasi** | Framer Motion | Ringan, profesional |
| **QR Code** | qrcode library | Client-side generate |
| **Hosting** | Vercel | Auto HTTPS, auto deploy |

---

## 🚀 Cara Menjalankan Lokal

### Prasyarat
- Node.js 18+
- npm (termasuk dengan Node.js)

### Langkah Cepat (5 menit)

```bash
# 1. Buka folder project
cd gema-akuntabilitas

# 2. Install semua dependencies
npm install

# 3. Setup database SQLite (langsung jalan, tanpa setup)
npx prisma generate
npx prisma db push

# 4. (Opsional) Buat akun admin
npx tsx src/lib/seed-admin.ts

# 5. Jalankan development server
npm run dev
```

Buka **http://localhost:3000** di browser.

---

## 📁 Struktur Folder

```
gema-akuntabilitas/
├── prisma/
│   └── schema.prisma              # ✅ 6 model database
│
├── src/
│   ├── app/
│   │   ├── (public)/              # Halaman publik
│   │   │   ├── page.tsx           # Landing page + logo
│   │   │   ├── materi/            # Halaman materi edukasi
│   │   │   ├── daftar/            # Form pendaftaran peserta
│   │   │   ├── quiz/              # Quiz engine (timer, auto-save)
│   │   │   ├── hasil/             # Hasil quiz + statistik
│   │   │   └── leaderboard/       # Papan peringkat
│   │   │
│   │   ├── admin/                 # Halaman admin (diproteksi)
│   │   │   ├── login/             # Form login admin
│   │   │   ├── dashboard/         # Statistik ringkas
│   │   │   ├── materi/            # CRUD materi
│   │   │   ├── soal/              # CRUD soal
│   │   │   ├── peserta/           # Data peserta + filter
│   │   │   └── pengaturan/        # Pengaturan + QR code
│   │   │
│   │   └── api/                   # 📡 13 endpoint REST
│   │       ├── materi/            # GET/POST materi
│   │       ├── materi/[id]/       # GET/PUT/DELETE materi
│   │       ├── soal/              # GET/POST soal
│   │       ├── soal/[id]/         # GET/PUT/DELETE soal
│   │       ├── pengaturan/        # GET/PUT pengaturan
│   │       ├── peserta/           # POST daftar peserta
│   │       ├── quiz-session/      # POST mulai/resume quiz
│   │       ├── quiz-session/[id]/ # GET detail session
│   │       ├── quiz-session/[id]/jawaban/  # PATCH auto-save
│   │       ├── quiz-session/[id]/submit/   # POST submit & skor
│   │       ├── leaderboard/       # GET peringkat
│   │       └── admin/
│   │           ├── auth/login/    # POST login
│   │           ├── auth/logout/   # POST logout
│   │           ├── statistik/     # GET statistik dashboard
│   │           └── peserta/       # GET data peserta
│   │
│   ├── shared/
│   │   ├── components/            # Komponen reusable
│   │   │   ├── Button.tsx         # Tombol (primary/secondary/danger)
│   │   │   ├── Card.tsx           # Kartu dengan shadow
│   │   │   ├── Input.tsx          # Input dengan label + error
│   │   │   └── AdminLayout.tsx    # Layout sidebar admin
│   │   └── utils/
│   │       └── formatDurasi.ts    # 125 → "2:05"
│   │
│   ├── lib/
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── session.ts             # JWT session utility
│   │   └── seed-admin.ts          # Script buat akun admin
│   │
│   ├── middleware.ts              # 🔒 Proteksi route /admin
│   └── types/
│       └── quiz.ts                # TypeScript interfaces
│
├── docs/
│   ├── architecture.md            # Dokumentasi arsitektur
│   └── testing-checklist.md       # Checklist testing manual
│
├── public/                        # 📁 Tempat upload logo!
│   ├── logo-bpk-ri.png            # ← Taruh logo BPK RI di sini
│   ├── logo-intosai.png           # ← Taruh logo INTOSAI di sini
│   └── logo-incosai.png           # ← Taruh logo INCOSAI di sini
│
├── .env.local                     # Environment variables
├── .env.local.example             # Template env
├── package.json
└── next.config.ts
```

---

## 🖼️ Upload Logo

### Cara 1: Drag & Drop (Termudah)
1. Buka folder **`public`** 
   ```
   D:\Kuliah TEKNOKRAT\PKL\Web-Game\gema-akuntabilitas\public
   ```
2. **Drag & drop** file logo Anda ke folder tersebut
3. Rename file menjadi:
   - `logo-bpk-ri.png` — untuk BPK RI
   - `logo-intosai.png` — untuk INTOSAI
   - `logo-incosai.png` — untuk INCOSAI
4. **Refresh browser** (http://localhost:3000)

### Cara 2: Via VS Code
1. Buka VS Code → folder `gema-akuntabilitas`
2. Klik folder **`public`** di sidebar
3. **Right-click** → `New File` → beri nama `logo-bpk-ri.png`
4. Copy-paste isi gambar logo ke file tersebut
5. Ulangi untuk `logo-intosai.png` dan `logo-incosai.png`

> **Format**: PNG, JPG, atau SVG. Ukuran ideal 200x200px.
>
> **Fallback**: Jika file belum ada, akan tampil teks placeholder "BPK RI", "INTOSAI", "INCOSAI".

---

## 👤 Akun Admin

### Buat Akun Admin
```bash
cd gema-akuntabilitas
npx tsx src/lib/seed-admin.ts
```
Output:
```
✅ Admin "admin" berhasil dibuat.
⚠️  JANGAN LUPA ganti password sebelum production!
```

### Login Admin
1. Buka **http://localhost:3000/admin/login**
2. Username: `admin`
3. Password: `admin123`

> ⚠️ **SEBELUM PRODUCTION**: Ganti password dengan menjalankan ulang seed dengan password baru, atau langsung edit di database.

---

## 📡 API Endpoints

### Publik (tanpa auth)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/materi` | List semua materi |
| `GET` | `/api/materi/[id]` | Detail materi |
| `GET` | `/api/soal` | List soal (tanpa jawaban benar) |
| `GET` | `/api/soal?admin=true` | List soal (dengan jawaban) — **perlu session** |
| `GET` | `/api/soal/[id]` | Detail soal |
| `GET` | `/api/pengaturan` | Pengaturan sistem |
| `POST` | `/api/peserta` | Daftar peserta baru |
| `POST` | `/api/quiz-session` | Mulai/resume quiz |
| `PATCH` | `/api/quiz-session/[id]/jawaban` | Auto-save jawaban |
| `POST` | `/api/quiz-session/[id]/submit` | Submit & hitung skor |
| `GET` | `/api/quiz-session/[id]` | Detail hasil session |
| `GET` | `/api/leaderboard` | Peringkat peserta |

### Admin (perlu session cookie)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/admin/auth/login` | Login admin |
| `POST` | `/api/admin/auth/logout` | Logout |
| `GET` | `/api/admin/statistik` | Statistik dashboard |
| `GET` | `/api/admin/peserta` | Data semua peserta |
| `POST` | `/api/materi` | Tambah materi |
| `PUT` | `/api/materi/[id]` | Edit materi |
| `DELETE` | `/api/materi/[id]` | Hapus materi |
| `POST` | `/api/soal` | Tambah soal |
| `PUT` | `/api/soal/[id]` | Edit soal |
| `DELETE` | `/api/soal/[id]` | Hapus soal |
| `PUT` | `/api/pengaturan` | Update pengaturan |

---

## 🏗️ Keputusan Arsitektur

### 1. Single Next.js App (Bukan Backend Terpisah)
**Dipilih karena**: Deployment sederhana (1 repo, 1 deploy ke Vercel), tidak ada CORS issues, lebih cepat untuk solo developer.

### 2. Skor Dihitung Server-Side
**Alasan**: `jawabanBenar` tidak pernah dikirim ke browser. Skor dihitung 100% di server saat submit. Mencegah kecurangan via DevTools.

### 3. Session Cookie Sederhana (Bukan NextAuth.js)
**Alasan**: Hanya butuh 1 akun admin. Cookie httpOnly + secure + sameSite.

### 4. Auto-Save & Resume
**Cara kerja**: Setiap jawaban langsung disimpan via PATCH (fire-and-forget). Refresh browser → session `in_progress` → resume dari soal terakhir.

> Detail lengkap: [docs/architecture.md](docs/architecture.md)

---

## 🌐 Deployment ke Vercel

### 1. Setup Production Database
Buat database PostgreSQL gratis di [Neon](https://neon.tech) atau [Supabase](https://supabase.com).

### 2. Set Environment Variables
Di Vercel Dashboard → Project Settings → Environment Variables:
```
DATABASE_URL=postgresql://user:pass@host/db
ADMIN_SESSION_SECRET=<generate dengan: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
```

### 3. Push Schema ke Database Production
```bash
npx prisma db push
```

### 4. Connect ke Vercel
- Push code ke GitHub
- Import repo di Vercel
- Deploy otomatis

---

## 🔧 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| **Server crash, laptop restart** | Downgrade ke Next.js 15: `npm install next@15.2.4` |
| **Error "Event handlers cannot be passed to Client Component"** | Tambahkan `"use client"` di atas file yang pakai `onClick`/`onError` |
| **Logo tidak muncul** | Taruh file PNG di folder `public/` dengan nama `logo-bpk-ri.png`, `logo-intosai.png`, `logo-incosai.png` |
| **Prisma error "DATABASE_URL not found"** | Buat file `.env` di root project dengan isi `DATABASE_URL="file:./dev.db"` |
| **Login admin ditolak** | Jalankan `npx tsx src/lib/seed-admin.ts` untuk buat akun |
| **Halaman admin redirect ke login terus** | Hapus cookie browser, login ulang |
| **Quiz tidak bisa dimulai** | Pastikan sudah ada minimal 1 soal di database (via admin panel) |

---

## 📊 Testing

### Manual Testing
Lihat checklist lengkap di [docs/testing-checklist.md](docs/testing-checklist.md)

### Alur yang perlu diuji:
1. **Landing → Materi** (tombol "Mulai" bekerja)
2. **Materi → Daftar** (semua materi ditandai selesai)
3. **Daftar → Quiz** (data diri valid)
4. **Quiz → Hasil** (timer, auto-save, submit)
5. **Hasil → Leaderboard** (peringkat muncul)
6. **Admin Login → Dashboard → CRUD → Logout**

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan portofolio/tugas individu.