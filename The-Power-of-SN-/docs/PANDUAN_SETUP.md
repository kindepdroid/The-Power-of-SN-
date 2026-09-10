# Panduan untuk pemilik website

## 1. Pahami tempat setiap komponen

- **GitHub** menyimpan kode dan riwayat perubahannya.
- **Hosting Next.js** menjalankan aplikasi. Gunakan layanan yang mendukung Next.js server; GitHub Pages atau hosting HTML statis tidak menjalankan fitur akun dan redaksi ini.
- **Supabase** menyimpan akun, database artikel, dan gambar.
- **Domain** adalah alamat website. Hubungkan setelah versi uji berhasil.

Biaya layanan belum dibeli atau dikunci. Periksa harga perpanjangan, batas penggunaan, biaya email, dan backup terhadap anggaran Rp2 juta awal dan Rp500 ribu per bulan. Pembangunan mandiri tetap memerlukan waktu pemeliharaan.

## 2. Menjalankan di laptop

1. Pasang Node.js 22 LTS atau LTS lebih baru yang kompatibel, dan editor kode.
2. Unduh/clone repositori lalu buka foldernya di editor.
3. Buka terminal pada folder proyek, jalankan `npm ci`.
4. Salin `.env.example` menjadi `.env.local`.
5. Jalankan `npm run dev`, buka `http://localhost:3000`.

Halaman dapat dibuka tanpa Supabase. Pendaftaran baru berfungsi setelah langkah berikutnya selesai.

## 3. Buat proyek Supabase milikmu

Buat proyek baru yang terpisah dari data penting. Catat password database di pengelola password, bukan di kode. Ambil Project URL dan **publishable key** dari pengaturan proyek, lalu isi:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT-MILIKMU.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=KEY_PUBLISHABLE_MILIKMU
```

Publishable key memang dipakai bersama kebijakan akses database. Jangan menggantinya dengan secret key atau `service_role` key. Kunci administratif tidak diperlukan oleh aplikasi ini.

Di SQL Editor proyek Supabase baru, jalankan isi `supabase/migrations/202609100001_initial.sql` sekali. Migrasi ini membuat tabel dan bucket gambar. Jangan menjalankannya pada database berisi sistem lain. Jangan menonaktifkan RLS untuk mengatasi error.

## 4. Atur verifikasi dan pemulihan email

Di konfigurasi Auth:

1. Aktifkan provider email dan **konfirmasi email wajib**.
2. Set Site URL ke `http://localhost:3000` saat uji lokal.
3. Gunakan template email yang menuju handler website berikut (pertahankan ekspresi template Supabase):

**Confirm signup** — tautan:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup">Verifikasi email</a>
```

**Reset password** — tautan:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery"
  >Atur password baru</a
>
```

Gunakan penyedia SMTP dengan domain pengirim terverifikasi sebelum mengundang kontributor nyata. Atur limit pengiriman/rate limit yang sesuai pada Supabase. Jika memakai layanan email bawaan untuk uji, periksa batas penerima dan pengirimannya di proyekmu. Periksa dokumentasi resmi saat konfigurasi karena letak menu dan batas layanan dapat berubah.

Website memverifikasi sesi dan email saat memberi akses; bukan hanya mengandalkan isi cookie dari browser.

## 5. Buat Super Admin pertama

1. Daftar melalui `/daftar` dengan email milikmu.
2. Klik verifikasi email yang diterima.
3. Di SQL Editor Supabase, periksa identitas akun dengan **email yang tepat**:

```sql
select id, email, email_confirmed_at
from auth.users
where email = 'GANTI_DENGAN_EMAIL_MILIKMU';
```

4. Setelah memastikan akun benar dan email sudah terverifikasi, gunakan UUID yang ditampilkan:

```sql
update public.profiles
set role = 'super_admin'
where id = 'GANTI_DENGAN_UUID_AKUN_YANG_SUDAH_DIPERIKSA';
```

5. Masuk lagi. Menu Data Kontributor menyediakan pengaturan peran untuk akun berikutnya. Admin Database tidak dapat mengangkat dirinya menjadi Super Admin.

Tidak ada password admin bawaan. Sistem juga tidak otomatis menjadikan pendaftar pertama sebagai admin.

## 6. Isi website melalui dashboard

- **Konten organisasi:** profil, visi, misi, email dan nomor resmi.
- **Pustaka gambar:** unggah logo dan foto yang boleh publik; salin URL hasil unggah ke kolom logo/gambar.
- **Pengurus:** pilih jenis Pengurus; nama pada judul dan jabatan pada deskripsi.
- **Program/kegiatan:** masukkan informasi, kontak, dan tanggal jika relevan. Centang Tampilkan kepada publik jika siap.
- **Artikel:** simpan draf sebelum mengajukan atau menerbitkan. Tombol publikasi memakai draf yang terakhir disimpan.

Gambar yang diunggah ke bucket `media` dapat dibaca melalui URL publik. Menyembunyikan konten tidak menghapus URL gambar. Jangan unggah informasi internal atau foto yang tidak boleh disebarkan. Metadata EXIF gambar belum dibersihkan otomatis; bersihkan foto sebelum diunggah jika berisi lokasi/perangkat yang tidak ingin dibagikan.

## 7. Pasang versi uji di hosting

1. Pilih hosting yang mendukung aplikasi Next.js dengan server Node.js dan Server Actions. Pastikan kompatibilitas versi Next.js yang terkunci di proyek.
2. Hubungkan repositori GitHub milikmu. Gunakan lingkungan uji dengan akses dibatasi; jangan arahkan domain utama dulu.
3. Isi tiga variabel lingkungan yang sama di pengaturan hosting. `NEXT_PUBLIC_SITE_URL` harus alamat HTTPS versi uji.
4. Isi Site URL pada Supabase agar sama persis dengan alamat versi uji. Untuk keamanan data, gunakan proyek Supabase uji terpisah dari produksi.
5. Jalankan proses deploy dari hosting. Perintah build: `npm run build`; jika self-host Node: jalankan `npm start` setelah build.
6. Uji semua peran, verifikasi email, pemulihan password, serta unggahan gambar dari perangkat nyata.

Kode dalam GitHub tidak otomatis menjadi website hanya karena sudah di-push. Hosting harus tersambung dan mendapat konfigurasi lingkungan.

## 8. Sebelum dibuka ke publik

- Isi konten, logo, nama/jabatan pengurus, serta kontak resmi yang telah diperiksa.
- Uji daftar → email → login → draf → pengajuan → persetujuan → publikasi → revisi.
- Uji admin menerbitkan artikel sendiri dan kontributor gagal mengakses akun orang lain.
- Periksa tampilan HP, keyboard, dan kondisi jaringan lambat.
- Pastikan HTTPS, pengaturan domain, dan alamat email pengirim berfungsi.
- Aktifkan backup database dan salinan media sesuai paket, lalu lakukan latihan pemulihan. Mengembalikan versi kode tidak memulihkan database.
- Lengkapi kebijakan privasi: kontak penanggung jawab, layanan yang benar-benar dipakai, dan masa simpan/prosedur penghapusan data.
- Pastikan akun GitHub, Supabase, hosting, domain, dan SMTP dimiliki/dikuasai organisasi atau pemilik yang ditunjuk; aktifkan autentikasi tambahan yang tersedia untuk akun layanan tersebut.

Pembelian domain, aktivasi layanan berbayar, dan peluncuran publik belum dilakukan dalam pembuatan kode ini.

## 9. Jika ada masalah

Salin pesan error yang relevan, URL halaman, langkah pemicu, serta hasil yang diharapkan. Jangan kirim token, password, email/nomor HP kontributor, atau isi `.env.local`. Perbaiki di branch terpisah, jalankan pemeriksaan, lalu deploy ulang setelah hasilnya diuji.

Referensi resmi: [Next.js](https://nextjs.org/docs/app/getting-started/installation), [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).
