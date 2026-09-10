# Keputusan produk yang diterapkan

Sumber keputusan: percakapan PRD Sahabat Nusa, termasuk perubahan terakhir mengenai Next.js dan hak admin menerbitkan artikelnya sendiri. Tidak ada pengambilan keputusan dari data tersembunyi atau konten contoh Canva.

| Area                  | Perilaku MVP                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Teknologi             | Next.js + TypeScript; Supabase sebagai layanan pendukung yang dipilih saat implementasi, belum dibuat atau dibeli untuk pengguna |
| Sasaran               | Anggota Sahabat Nusa, mahasiswa, akademisi; pembaca tidak harus masuk                                                            |
| Akun                  | Akun kontributor, bukan bukti keanggotaan organisasi                                                                             |
| Data wajib            | Nama, email, HP, instansi                                                                                                        |
| Data opsional         | Pendidikan deskripsi bebas; Instagram, TikTok, Threads, YouTube, LinkedIn, Facebook                                              |
| Peran                 | Kontributor/Admin Konten, Admin Database, Super Admin                                                                            |
| Persetujuan           | Kontributor: salah satu Admin Database atau Super Admin; satu keputusan cukup                                                    |
| Artikel admin sendiri | Admin Database/Super Admin boleh menerbitkan sendiri; keputusan menggantikan usulan R01 lama                                     |
| Identitas penulis     | Satu penulis, nama individu; bukan posisi resmi organisasi, termasuk pengurus                                                    |
| Format                | Artikel web, Markdown; tidak menggunakan PDF                                                                                     |
| Revisi publikasi      | Versi lama tayang sampai revisi diterbitkan                                                                                      |
| Program               | Informatif; kontak pengurus/organisasi, tanpa pendaftaran peserta                                                                |
| Pengurus              | Nama dan jabatan dipublikasikan lewat konten organisasi                                                                          |

## Asumsi operasional yang dipakai pada MVP

R02–R06 belum mendapat persetujuan eksplisit terpisah. Implementasi memakai pilihan konservatif berikut dan bisa disesuaikan setelah dicoba:

- Hanya satu versi aktif yang belum disetujui. Pengajuan terkunci, penulis dapat menarik pengajuan sebelum keputusan admin.
- Akun dinonaktifkan, tidak dihapus otomatis. Publikasi dan atribusi tetap ada. Permintaan penghapusan perlu prosedur pemilik.
- Nama penulis disalin pada versi awal. Perubahan nama profil tidak otomatis mengubah atribusi artikel yang sudah dibuat.
- Admin dapat menarik publikasi dengan alasan tercatat. Ini terpisah dari penolakan revisi.
- Status editorial dan catatan tersedia dalam dashboard; email digunakan untuk verifikasi dan pemulihan. Email keputusan belum dibuat.
- Koreksi editorial dikembalikan kepada penulis; perubahan langsung oleh admin terhadap isi penulis lain belum dibuat.
- Penulis harus menyimpan draf sebelum mengajukan/menerbitkan. Tidak ada autosave atau penyimpanan draf rahasia di browser.
- File gambar publik hanya diunggah admin. Gambar inline pada Markdown tidak dirender.

## Model data

- `profiles`: informasi akun internal dan hak akses.
- `articles`: satu penulis, slug tetap, penunjuk versi publik, status penarikan.
- `article_versions`: judul, ringkasan, isi, kategori, nama penulis, status, nomor versi penyimpanan.
- `editorial_decisions`: aktor, versi, tindakan, alasan, waktu.
- `organization`: profil dan kontak organisasi.
- `content_items`: pengurus, program, dokumentasi.
- `access_audit`: riwayat perubahan peran/aktivasi akun.

Publikasi mengganti penunjuk versi di transaksi yang sama dengan keputusan editorial. Constraint memastikan versi publik selalu milik artikel yang sama. Kunci artikel diambil sebelum kunci versi untuk konsistensi transaksi. Nomor versi mencegah keputusan dari tampilan lama menimpa keputusan terbaru.
