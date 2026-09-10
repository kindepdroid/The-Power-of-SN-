'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="container page-head">
      <h1>Halaman belum dapat dimuat</h1>
      <p>Terjadi gangguan saat mengambil data. Coba kembali beberapa saat lagi.</p>
      <button onClick={reset}>Coba lagi</button>
    </div>
  );
}
