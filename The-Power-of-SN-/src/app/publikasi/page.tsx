import Link from 'next/link';
import { listPublicArticles } from '@/lib/data';
import { categories } from '@/lib/validation';
import { ArticleCard, Empty } from '@/components/public';
export const metadata = { title: 'Publikasi' };
export const dynamic = 'force-dynamic';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === 'string' ? params.q.slice(0, 200) : '';
  const category =
    typeof params.category === 'string' &&
    categories.includes(params.category as (typeof categories)[number])
      ? params.category
      : '';
  const page = Math.max(1, Math.min(100000, Number.parseInt(params.page ?? '1', 10) || 1));
  const { articles: list, count } = await listPublicArticles({ q, category, page });
  const link = (p: number) =>
    '/publikasi?' + new URLSearchParams({ q, category, page: String(p) }).toString();
  return (
    <div className="container">
      <header className="page-head">
        <div className="eyebrow">Ruang pemikiran</div>
        <h1>Kajian & perspektif</h1>
        <p>
          Tulisan kontributor ditampilkan atas nama pribadi penulis, bukan sebagai posisi resmi
          Sahabat Nusa.
        </p>
      </header>
      <form className="search">
        <input
          name="q"
          aria-label="Cari judul atau penulis"
          placeholder="Cari judul, topik, atau penulis"
          defaultValue={q}
        />
        <select name="category" aria-label="Kategori" defaultValue={category}>
          <option value="">Semua kategori</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button>Cari tulisan</button>
      </form>
      {list.length ? (
        <>
          <p className="small muted">
            {count} publikasi · Halaman {page}
          </p>
          <div className="grid">
            {list.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </>
      ) : (
        <Empty
          title={
            q || category ? 'Tidak ada tulisan yang cocok' : 'Belum ada publikasi di halaman ini'
          }
        >
          <p>Coba kata kunci, kategori, atau halaman lain.</p>
        </Empty>
      )}
      <nav className="actions" aria-label="Halaman publikasi" style={{ marginTop: 30 }}>
        {page > 1 && (
          <Link className="button secondary" href={link(page - 1)}>
            ← Sebelumnya
          </Link>
        )}
        {page * 12 < count && (
          <Link className="button secondary" href={link(page + 1)}>
            Berikutnya →
          </Link>
        )}
      </nav>
    </div>
  );
}
