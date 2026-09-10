import Link from 'next/link';
export default function Page() {
  return (
    <div className="container page-head">
      <div className="eyebrow">404</div>
      <h1>Halaman tidak ditemukan</h1>
      <p>Tautan mungkin berubah atau konten belum dipublikasikan.</p>
      <Link className="button" href="/">
        Kembali ke beranda
      </Link>
    </div>
  );
}
