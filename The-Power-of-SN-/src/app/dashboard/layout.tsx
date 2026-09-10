import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { configured } from '@/lib/supabase/server';
import { isEditor } from '@/lib/validation';
import { signOut } from '../actions';
import { SubmitButton } from '@/components/forms';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard', robots: { index: false, follow: false } };
export default async function Layout({ children }: { children: React.ReactNode }) {
  if (!configured())
    return (
      <div className="container page-head">
        <h1>Dashboard sedang disiapkan</h1>
        <p>Layanan akun dan database belum terhubung.</p>
      </div>
    );
  const { profile: p } = await requireUser();
  return (
    <div className="container dashboard">
      <aside className="sidebar">
        <strong>{p.name}</strong>
        <span className="badge">
          {p.role === 'super_admin'
            ? 'Super Admin'
            : p.role === 'database_admin'
              ? 'Admin Database'
              : 'Kontributor'}
        </span>
        <nav aria-label="Menu dashboard">
          <Link href="/dashboard">Artikel saya</Link>
          <Link href="/dashboard/artikel/baru">Tulis artikel</Link>
          <Link href="/dashboard/profil">Profil akun</Link>
          {isEditor(p.role) && (
            <>
              <Link href="/dashboard/redaksi">Meja redaksi</Link>
              <Link href="/dashboard/konten">Konten organisasi</Link>
              <Link href="/dashboard/media">Pustaka gambar</Link>
              <Link href="/dashboard/pengguna">Data kontributor</Link>
            </>
          )}
        </nav>
        <form action={signOut}>
          <SubmitButton>Keluar</SubmitButton>
        </form>
      </aside>
      <section>{children}</section>
    </div>
  );
}
