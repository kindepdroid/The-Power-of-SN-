import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'Sahabat Nusa — Kajian & Gerakan Kolaboratif', template: '%s | Sahabat Nusa' },
  description:
    'Profil, program, kegiatan, dan publikasi Sahabat Nusa. Ruang kontribusi bagi mahasiswa dan akademisi.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <a href="#utama" className="skip">
          Lewati ke konten
        </a>
        <div className="topline" />
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="brand" aria-label="Sahabat Nusa beranda">
              <span className="brand-mark" aria-hidden>
                SN
              </span>
              <span>
                <strong>SAHABAT NUSA</strong>
                <small>KAJIAN · KOLABORASI · AKSI</small>
              </span>
            </Link>
            <nav className="nav" aria-label="Navigasi utama">
              <Link href="/tentang">Tentang kami</Link>
              <Link href="/program">Program</Link>
              <Link href="/publikasi">Publikasi</Link>
              <Link href="/kontak">Kontak</Link>
              <Link className="button" href="/kontribusi">
                Kontribusi
              </Link>
            </nav>
          </div>
        </header>
        <main id="utama">{children}</main>
        <footer className="footer">
          <div className="container footer-inner">
            <span>© {new Date().getFullYear()} Sahabat Nusa</span>
            <div>
              <Link href="/kebijakan-privasi">Privasi</Link>
              <Link href="/pedoman">Pedoman publikasi</Link>
              <Link href="/masuk">Masuk pengelola</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
