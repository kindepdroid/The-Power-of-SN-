export const metadata = { title: 'Pedoman publikasi' };
export default function Page() {
  return (
    <div className="container narrow">
      <header className="page-head">
        <h1>Pedoman publikasi</h1>
      </header>
      <div className="prose">
        <p>
          Ajukan tulisan orisinal yang relevan dengan kategori opini, kajian hukum, atau policy
          brief. Sertakan sumber yang dapat diperiksa untuk klaim faktual dan kutipan.
        </p>
        <p>
          Setiap artikel memiliki satu penulis. Penulis bertanggung jawab atas isi, ketepatan
          sumber, dan hak penggunaan materi. Hindari data pribadi pihak lain yang tidak diperlukan.
        </p>
        <p>
          Kontributor wajib melalui pemeriksaan Admin Database atau Super Admin. Kedua peran admin
          dapat menerbitkan artikel sendiri. Permintaan perubahan substansi dikembalikan kepada
          penulis.
        </p>
        <p>
          Nama penulis ditampilkan sebagai individu. Artikel tidak otomatis menjadi posisi resmi
          Sahabat Nusa, termasuk ketika penulis merupakan pengurus.
        </p>
        <p>
          Jika artikel yang sudah tayang direvisi, versi lama tetap ditampilkan sampai revisi
          disetujui. Redaksi dapat menarik publikasi dengan alasan yang tercatat.
        </p>
      </div>
    </div>
  );
}
