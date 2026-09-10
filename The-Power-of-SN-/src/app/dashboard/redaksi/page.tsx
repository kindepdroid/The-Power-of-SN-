import Link from 'next/link';
import { requireEditor } from '@/lib/auth';
import { Empty, statusLabels, formatDate } from '@/components/public';
import type { ArticleVersion } from '@/lib/types';
export default async function Page() {
  const { db } = await requireEditor();
  const { data: pending, error } = await db
    .from('article_versions')
    .select('*')
    .eq('status', 'submitted')
    .order('updated_at');
  if (error) throw error;
  const { data: live, error: ae } = await db
    .from('articles')
    .select('id,slug,withdrawn,published_version_id')
    .not('published_version_id', 'is', null)
    .order('created_at', { ascending: false });
  if (ae) throw ae;
  return (
    <>
      <h1>Meja redaksi</h1>
      <p className="muted">
        Satu keputusan dari Admin Database atau Super Admin cukup untuk menerbitkan tulisan.
      </p>
      <h2>Menunggu pemeriksaan ({pending.length})</h2>
      {pending.length ? (
        (pending as ArticleVersion[]).map((v) => (
          <article className="list-row" key={v.id}>
            <div className="row">
              <div>
                <h3>
                  <Link href={'/dashboard/redaksi/' + v.article_id}>{v.title}</Link>
                </h3>
                <p className="small muted">
                  {v.author_name} · {formatDate(v.updated_at)}
                </p>
                <span className="badge submitted">{statusLabels[v.status]}</span>
              </div>
              <Link className="button secondary" href={'/dashboard/redaksi/' + v.article_id}>
                Periksa
              </Link>
            </div>
          </article>
        ))
      ) : (
        <Empty title="Tidak ada pengajuan yang menunggu" />
      )}
      <section className="section">
        <h2>Riwayat publikasi</h2>
        {live.length ? (
          live.map((a) => (
            <div className="list-row row" key={a.id}>
              <div>
                <Link href={'/dashboard/redaksi/' + a.id}>
                  {a.slug.replace(/-[a-f0-9-]{36}$/, '').replaceAll('-', ' ')}
                </Link>
                <p className="small muted">{a.withdrawn ? 'Publikasi ditarik' : 'Sedang tayang'}</p>
              </div>
              <Link href={'/dashboard/redaksi/' + a.id}>Kelola →</Link>
            </div>
          ))
        ) : (
          <p className="muted">Belum ada artikel terbit.</p>
        )}
      </section>
    </>
  );
}
