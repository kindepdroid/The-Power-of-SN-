# Sahabat Nusa

**Website organisasi, program, dan publikasi untuk mahasiswa, akademisi, serta kontributor Sahabat Nusa.**

Sahabat Nusa menyediakan ruang untuk mengenal organisasi, membaca kajian, mengikuti informasi kegiatan, dan mengajukan tulisan melalui proses editorial. Website ini dibangun menggunakan **Next.js dan TypeScript**, dengan **Supabase** sebagai layanan akun, database, dan penyimpanan gambar.

> **Status: MVP / pengembangan awal.** Kode aplikasi dan pengujian lokal sudah tersedia. Konfigurasi layanan nyata, konten resmi, dan peluncuran publik masih perlu diselesaikan. Ketersediaan kode tidak berarti website sudah online.

## Tujuan proyek

- Memperkuat kredibilitas organisasi melalui profil, pengurus, program, dan dokumentasi yang dapat diakses publik.
- Menyediakan publikasi opini, kajian hukum, dan policy brief dalam bentuk artikel website.
- Memudahkan anggota Sahabat Nusa, mahasiswa, dan akademisi mengajukan tulisan.
- Menjaga proses publikasi melalui pemeriksaan admin dan riwayat keputusan editorial.
- Memungkinkan pengelola memperbarui konten sehari-hari melalui dashboard tanpa mengubah kode.

Akun kontributor digunakan untuk mengajukan artikel. Pendaftaran akun **tidak otomatis menjadi keanggotaan organisasi**.

## Fitur utama

| Area                   | Fitur dalam kode MVP                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| Halaman publik         | Beranda, tentang organisasi, pengurus, program, dokumentasi kegiatan, kemitraan, dan kontak          |
| Publikasi              | Daftar dan detail artikel, pencarian, kategori, serta navigasi halaman                               |
| Akun                   | Pendaftaran, verifikasi email, kirim ulang verifikasi, login, logout, pemulihan password, dan profil |
| Kontributor            | Menulis draf, mengajukan artikel, melihat catatan redaksi, dan membuat revisi                        |
| Redaksi                | Memeriksa pengajuan, menyetujui, meminta perbaikan, menolak, dan menarik publikasi dengan alasan     |
| Pengelolaan organisasi | Memperbarui profil, pengurus, program, kegiatan, kontak, dan gambar                                  |
| Hak akses              | Pembatasan berdasarkan peran, penonaktifan akun, dan pencatatan perubahan akses                      |
| Penemuan konten        | Metadata judul/deskripsi, sitemap, dan aturan robots                                                 |

Program dan kegiatan bersifat informatif. Informasi lanjutan atau pendaftaran dilakukan melalui kontak pengurus atau nomor resmi organisasi, bukan melalui sistem pendaftaran peserta di website.

## Peran pengguna

| Peran                      | Kewenangan                                                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Pengunjung                 | Membaca informasi organisasi, program, dan artikel yang sudah dipublikasikan                                      |
| Kontributor / Admin Konten | Mengelola tulisan sendiri dan mengajukannya kepada redaksi                                                        |
| Admin Database             | Memeriksa dan menerbitkan artikel, mengelola konten organisasi, serta mengakses data kontributor untuk koordinasi |
| Super Admin                | Memiliki kewenangan editorial dan pengelolaan konten, serta mengatur peran dan aktivasi akun                      |

**Admin Database dan Super Admin boleh menerbitkan artikel yang ditulisnya sendiri tanpa persetujuan admin lain.** Untuk artikel kontributor, persetujuan salah satu dari kedua peran tersebut sudah cukup.

## Pendaftaran dan privasi

| Data                | Ketentuan                                                             |
| ------------------- | --------------------------------------------------------------------- |
| Nama                | Wajib; digunakan untuk atribusi penulis                               |
| Email               | Wajib; diverifikasi untuk akses akun                                  |
| Nomor HP            | Wajib; untuk koordinasi internal dengan admin                         |
| Instansi / afiliasi | Wajib                                                                 |
| Pendidikan          | Opsional, berupa kolom teks bebas                                     |
| Media sosial        | Opsional: Instagram, TikTok, Threads, YouTube, LinkedIn, dan Facebook |

Pada artikel, identitas publik penulis berupa **nama individu**. Email, nomor HP, instansi, pendidikan, dan media sosial dari profil akun tidak ditampilkan secara otomatis kepada pengunjung. Nama dan jabatan pengurus dikelola secara terpisah sebagai konten organisasi yang memang ditujukan untuk publikasi.

## Alur editorial

1. Kontributor mendaftar dan memverifikasi email.
2. Penulis menyimpan artikel sebagai draf.
3. Draf diajukan kepada redaksi dan terkunci selama pemeriksaan. Penulis dapat menarik pengajuan sebelum keputusan untuk mengeditnya kembali.
4. Admin menyetujui dan menerbitkan, meminta perbaikan, atau menolak dengan catatan.
5. Jika artikel yang telah terbit direvisi, perubahan dibuat sebagai versi terpisah.
6. **Versi lama tetap tayang sampai revisi disetujui.** Penolakan revisi tidak menghapus versi yang sedang tayang.

Ketentuan implementasi:

- Satu artikel memiliki satu penulis dan satu revisi aktif yang belum disetujui.
- Menyimpan draf tidak otomatis mengajukan atau menerbitkan artikel.
- Tombol pengajuan/publikasi menggunakan draf yang terakhir disimpan; tidak ada autosave.
- Tulisan ditampilkan sebagai pandangan pribadi penulis, termasuk apabila penulis merupakan pengurus, bukan sebagai posisi resmi Sahabat Nusa.
- Keputusan editorial mencatat pelaku, versi artikel, tindakan, catatan, dan waktu.
- Artikel menggunakan Markdown, bukan PDF. HTML mentah dan gambar dalam isi Markdown tidak dirender.
- Pada MVP, koreksi terhadap tulisan penulis lain disampaikan melalui catatan redaksi; penyuntingan langsung oleh admin belum tersedia.

Rincian keputusan dan asumsi operasional tercantum dalam [Keputusan Produk](docs/KEPUTUSAN_PRODUK.md).

## Teknologi

| Komponen             | Teknologi / fungsi                                                  |
| -------------------- | ------------------------------------------------------------------- |
| Aplikasi website     | Next.js App Router, versi terkunci pada `package.json`              |
| Bahasa               | TypeScript                                                          |
| Antarmuka            | React dan CSS responsif                                             |
| Autentikasi          | Supabase Auth dengan integrasi sesi server                          |
| Database             | PostgreSQL melalui Supabase                                         |
| Pembatasan data      | Row Level Security dan fungsi database untuk mutasi                 |
| Gambar               | Supabase Storage, unggahan oleh admin                               |
| Validasi isian       | Zod                                                                 |
| Artikel              | React Markdown                                                      |
| Pengujian            | Node.js test runner, TypeScript, dan PostgreSQL WASM melalui PGlite |
| Pemeriksaan otomatis | Konfigurasi GitHub Actions untuk pemeriksaan tipe, tes, dan build   |

Versi dependensi disimpan dalam `package-lock.json`. Gunakan `npm ci` untuk mengikuti versi yang dikunci.

## Menjalankan di komputer sendiri

### 1. Siapkan proyek

Gunakan **Node.js 22 atau versi lebih baru yang kompatibel** dan npm. Ekstrak paket kode, atau clone repositori setelah kode tersedia di dalamnya:

```bash
git clone https://github.com/kindepdroid/The-Power-of-SN-.git
cd The-Power-of-SN-
npm ci
```

Jika memakai paket ZIP, buka terminal pada folder yang langsung berisi `package.json`, lalu jalankan `npm ci`.

### 2. Siapkan konfigurasi lokal

Salin `.env.example` menjadi `.env.local`. File dapat disalin melalui File Explorer; pengguna terminal macOS/Linux dapat menjalankan:

```bash
cp .env.example .env.local
```

Isi konfigurasi milik proyekmu:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT-MILIKMU.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=KEY_PUBLISHABLE_MILIKMU
```

Jangan mengunggah `.env.local` ke GitHub. Gunakan **publishable key**, bukan secret key atau `service_role` key.

### 3. Jalankan aplikasi

```bash
npm run dev
```

Buka `http://localhost:3000` di browser.

Tanpa konfigurasi Supabase, halaman publik menampilkan keadaan kosong dan layanan akun belum tersedia. Setelah konfigurasi berubah, hentikan lalu jalankan ulang aplikasi.

### 4. Aktifkan database dan akun

1. Buat proyek Supabase baru milik pengelola.
2. Jalankan [migrasi awal](supabase/migrations/202609100001_initial.sql) pada proyek tersebut satu kali.
3. Aktifkan konfirmasi email dan atur template verifikasi/pemulihan sesuai panduan.
4. Daftarkan serta verifikasi akun pemilik.
5. Tetapkan akun pemilik yang telah diperiksa sebagai Super Admin pertama melalui SQL Editor.
6. Masukkan profil, pengurus, kontak, dan konten awal melalui dashboard.

**Panduan lengkap:** [PANDUAN_SETUP.md](docs/PANDUAN_SETUP.md), termasuk template email, pembuatan Super Admin, dan persiapan hosting. Tidak ada akun atau password admin bawaan.

## Struktur proyek

| Lokasi                | Isi                                                             |
| --------------------- | --------------------------------------------------------------- |
| `src/app`             | Halaman, navigasi aplikasi, dan Server Actions                  |
| `src/components`      | Komponen antarmuka dan formulir                                 |
| `src/lib`             | Validasi, pemeriksaan akses, klien Supabase, dan pembacaan data |
| `src/proxy.ts`        | Penanganan pembaruan sesi untuk rute akun dan dashboard         |
| `supabase/migrations` | Tabel, kebijakan akses, dan transaksi editorial                 |
| `tests`               | Tes validasi dan perilaku database                              |
| `docs`                | Panduan setup, keputusan produk, dan laporan pengujian          |
| `.github/workflows`   | Konfigurasi pemeriksaan otomatis GitHub                         |

## Pengujian

Jalankan dari folder proyek:

```bash
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

Berdasarkan pemeriksaan lokal **10 September 2026**, pemeriksaan TypeScript dan build produksi berhasil. Test runner melaporkan **29 hasil lulus**: 20 skenario database, 8 validasi, dan 1 induk pengujian. Audit dependensi produksi saat itu tidak melaporkan kerentanan.

Pengujian mencakup akses antar-akun, larangan publikasi oleh kontributor, hak admin menerbitkan tulisan sendiri, revisi yang mempertahankan versi tayang, penolakan keputusan dengan nomor versi lama, serta penonaktifan akun.

Tes database menggunakan PGlite dengan tiruan minimal skema Auth/Storage. **Email nyata, sesi browser, unggahan pada layanan produksi, uji beban, dan deployment belum diverifikasi.** Konfigurasi GitHub Actions tersedia; hasil lokal tidak dianggap sebagai bukti bahwa workflow sudah berjalan di GitHub. Lihat [Laporan Validasi](docs/VALIDASI.md).

## Deployment dan kesiapan peluncuran

Kode di GitHub harus dipasang pada hosting yang mendukung **Next.js dengan server**, kemudian dihubungkan dengan Supabase dan konfigurasi lingkungan. Hosting HTML statis saja tidak menjalankan fitur akun dan redaksi aplikasi ini.

Sebelum membuka website kepada publik:

- Hubungkan layanan akun, database, penyimpanan gambar, dan email.
- Uji pendaftaran sampai publikasi dan revisi menggunakan akun nyata dengan peran berbeda.
- Periksa tampilan HP/laptop serta interaksi browser.
- Lengkapi konten resmi, logo, pengurus, dan kontak organisasi.
- Lengkapi kebijakan privasi serta prosedur retensi dan penghapusan data.
- Siapkan HTTPS, domain, backup database/media, dan latihan pemulihan.

Pemilihan paket hosting, pembelian domain, dan aktivasi layanan berbayar belum dilakukan. Gunakan lingkungan uji sebelum produksi. Mengembalikan versi kode tidak otomatis mengembalikan isi database.

## Batas MVP

Belum termasuk editor rich text visual, unggahan gambar kontributor, penyuntingan langsung artikel orang lain, notifikasi keputusan melalui email, komentar pembaca, analitik pengunjung, pembayaran, atau pendaftaran peserta kegiatan.

Gambar yang diunggah admin ke bucket publik dapat diakses melalui URL, walaupun belum dipasang pada halaman. Penghapusan metadata EXIF otomatis belum tersedia. Penonaktifan akun tidak otomatis menghapus artikel atau atribusi penulis.

## Pengembangan lanjutan

Perubahan rutin seperti artikel, program, dan pengurus dilakukan melalui dashboard. Untuk perubahan kode:

1. Jelaskan masalah atau kebutuhan dengan langkah yang dapat direproduksi.
2. Buat perubahan pada branch terpisah.
3. Pertahankan aturan PRD dan pembatasan akses.
4. Jalankan pemeriksaan tipe, tes yang relevan, dan build.
5. Periksa hasil sebelum menggabungkan perubahan dan melakukan deployment ulang.

Jangan memasukkan password, token, atau data pribadi kontributor ke laporan masalah. Pedoman teknis tersedia di [SECURITY.md](SECURITY.md).

## Dokumentasi pendamping

- [Panduan Setup](docs/PANDUAN_SETUP.md)
- [Keputusan Produk](docs/KEPUTUSAN_PRODUK.md)
- [Laporan Validasi](docs/VALIDASI.md)
- [Catatan Keamanan](SECURITY.md)

README ini menjelaskan kode MVP yang telah disiapkan. Status layanan dan kesiapan peluncuran perlu diperbarui ketika konfigurasi serta pengujian produksi selesai.
