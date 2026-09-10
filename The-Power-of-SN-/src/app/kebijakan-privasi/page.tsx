import Link from 'next/link';
export const metadata = { title: 'Privasi kontributor' };
export default function Page() {
  return (
    <div className="container narrow">
      <header className="page-head">
        <h1>Privasi kontributor</h1>
      </header>
      <div className="prose">
        <p>
          Pendaftaran meminta nama, email, nomor HP, dan instansi untuk pengelolaan akun serta
          koordinasi editorial. Pendidikan dan tautan media sosial bersifat opsional.
        </p>
        <p>
          Nama penulis ditampilkan pada artikel. Nomor HP, email, pendidikan, instansi, dan media
          sosial dari profil akun tidak ditampilkan secara otomatis kepada publik. Pengelola yang
          berwenang dapat mengakses profil untuk koordinasi.
        </p>
        <p>
          Website menggunakan cookie sesi untuk proses masuk. Data akun, tulisan, dan gambar
          disimpan pada layanan pendukung website. Riwayat keputusan editorial disimpan untuk
          menelusuri perubahan publikasi.
        </p>
        <p>
          Penonaktifan akun tidak otomatis menghapus artikel yang telah terbit. Permintaan koreksi
          atau penghapusan data dapat disampaikan melalui{' '}
          <Link href="/kontak">kontak organisasi</Link>.
        </p>
      </div>
    </div>
  );
}
