import Link from 'next/link';
export const metadata = { title: 'Menjadi kontributor' };
export default function Page() {
  return (
    <div className="container narrow">
      <header className="page-head">
        <div className="eyebrow">Kontribusi tulisan</div>
        <h1>Bagikan perspektifmu.</h1>
        <p>
          Anggota Sahabat Nusa, mahasiswa, dan akademisi dapat mengajukan artikel untuk
          dipublikasikan.
        </p>
      </header>
      <div className="stack">
        <div className="card">
          <h3>1. Daftar dan verifikasi email</h3>
          <p>
            Isi identitas dan kontak koordinasi. Akun kontributor tidak otomatis menjadi keanggotaan
            organisasi.
          </p>
          <h3>2. Tulis dan ajukan artikel</h3>
          <p>
            Satu artikel memiliki satu penulis. Simpan draf, periksa isinya, lalu ajukan ke redaksi.
          </p>
          <h3>3. Ikuti pemeriksaan redaksi</h3>
          <p>
            Admin dapat menyetujui, meminta perbaikan, atau menolak tulisan dengan catatan. Revisi
            artikel yang sudah tayang tidak menggantikan versi publik sebelum disetujui.
          </p>
        </div>
        <div className="actions">
          <Link href="/daftar" className="button">
            Daftar kontributor
          </Link>
          <Link href="/masuk" className="button secondary">
            Sudah punya akun
          </Link>
          <Link href="/pedoman">Baca pedoman</Link>
        </div>
      </div>
    </div>
  );
}
