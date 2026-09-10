import { notFound } from 'next/navigation';
import Link from 'next/link';
import { publicArticle } from '@/lib/data';
import { Markdown, formatDate } from '@/components/public';
export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = await publicArticle((await params).slug);
  return a ? { title: a.title, description: a.summary } : {};
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const a = await publicArticle((await params).slug);
  if (!a) notFound();
  return (
    <article className="container narrow">
      <header className="page-head article-header">
        <Link href="/publikasi" className="small muted">
          ← Kembali ke publikasi
        </Link>
        <p style={{ marginTop: 30 }}>
          <span className="badge">{a.category}</span>
        </p>
        <h1>{a.title}</h1>
        <p className="summary">{a.summary}</p>
        <div className="small muted">
          Oleh <strong>{a.author_name}</strong> · {formatDate(a.published_at)}
        </div>
      </header>
      <Markdown body={a.body} />
      <aside className="notice" style={{ marginTop: 40 }}>
        Tulisan ini merupakan pandangan pribadi penulis dan tidak mewakili posisi resmi Sahabat
        Nusa.
      </aside>
    </article>
  );
}
