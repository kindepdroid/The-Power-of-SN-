# Status implementasi dan validasi

Tanggal pemeriksaan lokal: 10 September 2026.

## Hasil yang sudah dibuktikan

| Pemeriksaan                   | Hasil                                                                     |
| ----------------------------- | ------------------------------------------------------------------------- |
| Pemeriksaan TypeScript        | Lulus                                                                     |
| Build produksi Next.js 16.3.4 | Lulus, termasuk halaman tanpa konfigurasi layanan                         |
| Pengujian otomatis            | 29 laporan tes lulus: 20 skenario database, 8 validasi, 1 induk pengujian |
| `npm audit --omit=dev`        | Tidak ada kerentanan yang dilaporkan saat pemeriksaan                     |
| Pemeriksaan perubahan Git     | Tidak ada kesalahan whitespace yang ditemukan                             |

Pengujian database benar-benar menjalankan SQL migrasi dan fungsi editorial pada PostgreSQL WASM melalui PGlite. Skema identitas pengguna dan Storage ditiru secara minimal untuk menguji otorisasi; ini tidak menghubungi proyek Supabase sungguhan.

## Skenario database

1. Pendaftar tidak dapat memilih peran admin melalui metadata.
2. Akun belum terverifikasi tidak dapat membuat artikel.
3. Kontributor terverifikasi dapat membuat draf.
4. Pengunjung tidak dapat membaca draf atau profil pribadi.
5. Kontributor lain tidak dapat membaca/mengubah draf lewat akses database langsung.
6. Kontributor tidak dapat menerbitkan atau menulis langsung ke tabel.
7. Nilai versi kosong tidak melewati pemeriksaan konflik.
8. Pengajuan mengunci versi dari perubahan.
9. Satu keputusan admin cukup; keputusan ganda dengan versi lama ditolak.
10. Publik hanya membaca versi yang disetujui.
11. View publik menggabungkan artikel dengan versi tayang, tanpa kontak/instansi profil.
12. Satu revisi aktif; versi lama tetap tersedia.
13. Penyimpanan dengan nomor versi lama ditolak.
14. Penolakan revisi memerlukan alasan dan tidak menghilangkan versi tayang.
15. Persetujuan revisi mengganti versi publik dalam transaksi yang sama.
16. Admin Database dan Super Admin dapat menerbitkan draf sendiri.
17. Kontributor dan Admin Database tidak dapat menaikkan hak akses.
18. Penonaktifan menghentikan mutasi tetapi mempertahankan publikasi.
19. Penarikan artikel menghilangkan akses publik dan mencatat alasan.
20. Perubahan organisasi memerlukan hak admin dan versi data yang tepat.

## Belum diuji terhadap layanan nyata

- Pengiriman, keterlambatan, pembatasan, dan penerimaan email verifikasi/pemulihan.
- Sesi browser lengkap, cookie lintas deployment, login/logout, refresh token, dan pemulihan di perangkat nyata.
- Storage API produksi, unggahan nyata, limit provider, dan konfigurasi bucket pada proyek pemilik.
- Interaksi browser/visual, aksesibilitas menyeluruh, keyboard, dan tampilan perangkat fisik.
- Banyak koneksi database simultan dan uji beban. Tes konflik memeriksa keputusan dari versi lama secara berurutan, bukan simulasi beban concurrent.
- Deploy hosting, domain, HTTPS, backup, pemulihan, dan pemantauan produksi.
- Hasil workflow GitHub Actions di server GitHub; konfigurasi workflow disertakan, hasil lokal tidak dianggap sebagai bukti CI remote.

Tidak ada klaim bebas bug atau audit keamanan menyeluruh. Lulus build/test membuktikan skenario di atas, bukan semua kemungkinan perilaku. Jangan mengundang pengguna produksi sebelum konfigurasi dan uji layanan nyata selesai.
