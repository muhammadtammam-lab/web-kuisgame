# TESTING CHECKLIST — Gema Akuntabilitas Quiz App

## ALUR PESERTA (uji dari HP asli)
- [ ] Landing page tampil benar, CTA "Mulai" berfungsi
- [ ] Materi termuat dari API, tombol lanjut disabled sebelum semua ditandai selesai
- [ ] Form data diri: validasi wajib berfungsi, submit sukses membuat peserta baru
- [ ] Quiz: soal termuat sesuai jumlah di pengaturan, timer berjalan akurat
- [ ] Jawaban tersimpan otomatis (coba refresh browser di tengah quiz — resume ke soal yang sama?)
- [ ] Timer habis → otomatis submit dan pindah ke halaman hasil
- [ ] Submit manual di soal terakhir berfungsi
- [ ] Halaman hasil menampilkan nilai yang konsisten dengan jawaban yang dipilih
- [ ] Coba submit quiz session yang sama 2x (balik ke /quiz manual) → harus ditolak
- [ ] Leaderboard menampilkan peserta yang baru selesai dengan urutan benar

## ALUR ADMIN
- [ ] Akses /admin/dashboard tanpa login → redirect ke /admin/login
- [ ] Login dengan password salah → ditolak dengan pesan jelas
- [ ] Login dengan password benar → masuk dashboard, statistik tampil
- [ ] CRUD Materi: tambah, edit, hapus semua berfungsi
- [ ] CRUD Soal: tambah, edit, hapus semua berfungsi
- [ ] Halaman Peserta menampilkan data & nilai akurat
- [ ] Pengaturan: ubah jumlah soal/durasi/acak, coba mulai quiz baru → perubahan berlaku
- [ ] QR Code ter-generate dan bisa didownload
- [ ] Logout berfungsi, setelah logout /admin/dashboard tidak bisa diakses

## LINTAS DEVICE
- [ ] Test di minimal 2 ukuran layar HP berbeda
- [ ] Test koneksi lambat (throttle network) — loading state jelas, tidak blank