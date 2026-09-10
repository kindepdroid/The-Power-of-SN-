import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { Empty, statusLabels } from '@/components/public';
import type { ArticleVersion } from '@/lib/types';
export default async function Page() {
  const { db, user } = await requireUser();
  const { data: articles, error } = await db
    .from('articles')
    .select('*')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const { data: versions, error: ve } = await db
    .from('article_versions')
    .select('*')
    .in(
      'article_id',
      articles.length ? articles.map((a) => a.id) : ['00000000-0000-0000-0000-000000000000'],
    )
    .order('created_at', { ascending: false });
  if (ve) throw ve;
  return (
    <>
      <div className="row">
        <h1>Artikel saya</h1>
        <Link className="button" href="/dashboard/artikel/baru">
          Tulis artikel
        </Link>
      </div>
      <p className="muted">Kelola draf, pengajuan, dan revisi tulisanmu.</p>
      {articles.length ? (
        articles.map((a) => {
          const v = (versions as ArticleVersion[]).find((v) => v.article_id === a.id);
          return (
            <article className="list-row" key={a.id}>
              <div className="row">
                <div>
                  <h3>
                    <Link href={'/dashboard/artikel/' + a.id}>{v?.title}</Link>
                  </h3>
                  <span className={'badge ' + v?.status}>{statusLabels[v?.status ?? 'draft']}</span>{' '}
                  <span className="small muted">
                    {a.published_version_id
                      ? a.withdrawn
                        ? 'Publikasi ditarik'
                        : 'Ada versi tayang'
                      : 'Belum tayang'}
                  </span>
                </div>
                <Link href={'/dashboard/artikel/' + a.id}>Kelola →</Link>
              </div>
            </article>
          );
        })
      ) : (
        <Empty title="Belum ada tulisan">
          <p>Mulai dengan menyimpan draf artikel pertamamu.</p>
        </Empty>
      )}
    </>
  );
}
