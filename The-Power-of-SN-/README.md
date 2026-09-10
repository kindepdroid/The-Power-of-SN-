# Sahabat Nusa

Website organisasi dan publikasi kontributor menggunakan **Next.js App Router + TypeScript**, dengan **Supabase Auth, PostgreSQL, dan Storage**. Ini kode MVP yang dapat dikonfigurasi; belum terhubung ke layanan produksi dan belum diluncurkan.

## Mulai dari sini

Untuk pemilik yang baru belajar, ikuti [panduan setup](docs/PANDUAN_SETUP.md). Jangan menyalin password atau kunci rahasia ke chat, GitHub, atau kode sumber.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Buka `http://localhost:3000`. Gunakan Node.js **22 LTS atau versi LTS lebih baru yang kompatibel**. Di Windows, salin `.env.example` lewat File Explorer jika perintah `cp` tidak tersedia.

Tanpa konfigurasi Supabase, halaman publik menampilkan keadaan kosong dan pendaftaran belum dibuka. Ini bukan akun demo; dashboard tidak menggunakan autentikasi palsu. Setelah variabel diisi, hentikan lalu jalankan ulang server pengembangan.

## Fitur yang dibuat

- Beranda, profil organisasi, pengurus, program, dokumentasi, kontak, kontribusi, dan publikasi artikel di website.
- Pencarian judul/ringkasan/penulis dan penyaringan kategori.
- Pendaftaran dengan nama, email, nomor HP, instansi; pendidikan bebas dan enam platform media sosial opsional.
- Verifikasi email, kirim ulang verifikasi, login, pemulihan password, logout, dan profil akun.
- Draf artikel, satu penulis, pengajuan terkunci, penarikan pengajuan, catatan redaksi, persetujuan, dan penolakan.
- Admin Database dan Super Admin boleh menerbitkan tulisan sendiri tanpa persetujuan admin lain.
- Satu revisi aktif per artikel. Versi lama tetap tayang sampai revisi diterbitkan. Kontrol versi mencegah penyimpanan atau keputusan dari halaman kedaluwarsa.
- Pengelolaan profil organisasi, pengurus, program, dokumentasi, kontak publik, serta unggahan gambar oleh admin.
- Data profil kontributor dibatasi. Super Admin mengatur peran dan penonaktifan. Akun nonaktif tidak dapat memutasi data, tetapi atribusi dan artikel publik tetap ada.
- Metadata judul/deskripsi, sitemap, robots, tampilan responsif, label formulir, dan Markdown tanpa HTML mentah atau gambar inline.

## Arsitektur

Browser → Next.js Server Components/Server Actions → Supabase dengan sesi pengguna → PostgreSQL dan Row Level Security.

Tidak ada `service_role` key dalam aplikasi. Pemeriksaan peran dilakukan di server dan di fungsi database. Mutasi artikel dan keputusan dilakukan secara transaksional; bukan beberapa permintaan terpisah yang bisa meninggalkan status setengah berubah.

- `src/app`: halaman dan Server Actions.
- `src/lib`: validasi, otorisasi, klien Supabase, dan pembacaan data.
- `src/components`: komponen tampilan dan formulir.
- `supabase/migrations`: skema, kebijakan akses, dan transaksi editorial.
- `tests`: pengujian validasi dan migrasi PostgreSQL melalui PGlite.
- `docs`: setup, aturan PRD yang diterapkan, dan status pengujian.

## Verifikasi

```bash
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

CI GitHub menjalankan pemeriksaan tipe, pengujian, dan build tanpa kredensial produksi. `package-lock.json` dikomit agar versi instalasi dapat direproduksi.

## Batas rilis ini

Email dan penyimpanan memerlukan proyek Supabase nyata beserta konfigurasinya. Pengujian database lokal memakai mesin PostgreSQL WASM (PGlite) dengan tiruan minimal skema Auth/Storage, bukan pengiriman email atau akses Storage produksi. Lihat [laporan pengujian](docs/VALIDASI.md).

Belum termasuk: migrasi konten Canva otomatis, domain/hosting berbayar, editor rich text visual, unggahan gambar kontributor, koreksi langsung tulisan milik penulis lain, notifikasi keputusan via email, analitik pengunjung, komentar, pembayaran, atau pendaftaran peserta kegiatan. Redaksi mengembalikan koreksi kepada penulis melalui catatan. Konten resmi dan logo belum tersedia; tidak ada identitas pengurus atau kegiatan fiktif yang ditanamkan.

Kebijakan privasi dan pedoman publikasi adalah teks operasional awal. Lengkapi kontak resmi, penyedia layanan, dan ketentuan retensi data sebelum mengundang pengguna sungguhan.
