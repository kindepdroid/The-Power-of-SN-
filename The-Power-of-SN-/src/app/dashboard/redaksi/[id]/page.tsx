import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requireEditor } from '@/lib/auth';
import { authorArticle } from '@/lib/data';
import { Markdown, statusLabels, formatDate } from '@/components/public';
import { SmartForm } from '@/components/forms';
import { transition } from '@/app/actions';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { db } = await requireEditor();
  const record = await authorArticle(db, id);
  if (!record) notFound();
  const { article: a, versions } = record;
  const incoming = versions.find((v) => v.status === 'submitted');
  const live = versions.find((v) => v.id === a.published_version_id);
  const current = incoming ?? live ?? versions[0];
  if (!current) notFound();
  const { data: author, error } = await db
    .from('profiles')
    .select('name,phone,institution')
    .eq('id', a.author_id)
    .single();
  if (error) throw error;
  const { data: decisions, error: de } = await db
    .from('editorial_decisions')
    .select('*')
    .in(
      'version_id',
      versions.map((v) => v.id),
    )
    .order('created_at', { ascending: false });
  if (de) throw de;
  return (
    <>
      <Link href="/dashboard/redaksi" className="small muted">
        ← Meja redaksi
      </Link>
      <h1 style={{ marginTop: 20 }}>Pemeriksaan artikel</h1>
      <div className="notice">
        Penulis: <strong>{author.name}</strong> · {author.institution}
        <br />
        Kontak koordinasi: {author.phone}
      </div>
      <div className={incoming && live ? 'preview-columns' : 'stack'}>
        {incoming && live && (
          <section className="card">
            <span className="badge">Versi {a.withdrawn ? 'ditarik' : 'tayang'}</span>
            <h2 style={{ marginTop: 20 }}>{live.title}</h2>
            <p>{live.summary}</p>
            <Markdown body={live.body} />
          </section>
        )}
        <section className="card">
          <span className={'badge ' + current.status}>
            {incoming ? 'Versi diajukan' : statusLabels[current.status]}
          </span>
          <h2 style={{ marginTop: 20 }}>{current.title}</h2>
          <p>{current.summary}</p>
          <Markdown body={current.body} />
        </section>
      </div>
      {incoming && (
        <section className="section">
          <h2>Keputusan redaksi</h2>
          <SmartForm
            action={transition}
            submit="Simpan keputusan"
            confirm="Simpan keputusan untuk versi artikel ini?"
          >
            <input type="hidden" name="version" value={incoming.id} />
            <input type="hidden" name="expected" value={incoming.lock_version} />
            <label>
              Keputusan
              <select name="action" defaultValue="request_changes">
                <option value="request_changes">Minta perbaikan</option>
                <option value="reject">Tolak pengajuan</option>
                <option value="publish">Setujui dan publikasikan</option>
              </select>
            </label>
            <label>
              Catatan untuk penulis
              <textarea name="note" maxLength={2000} />
              <span className="help">
                Wajib untuk permintaan perbaikan atau penolakan. Perubahan substansi dikembalikan
                kepada penulis.
              </span>
            </label>
          </SmartForm>
        </section>
      )}
      {live && !a.withdrawn && (
        <details className="details" style={{ marginTop: 25 }}>
          <summary>Tarik artikel dari publik</summary>
          <SmartForm
            action={transition}
            submit="Tarik publikasi"
            confirm="Artikel akan disembunyikan dari publik. Lanjutkan?"
          >
            <input type="hidden" name="version" value={live.id} />
            <input type="hidden" name="expected" value={live.lock_version} />
            <input type="hidden" name="action" value="withdraw" />
            <label>
              Alasan penarikan
              <textarea name="note" required minLength={3} maxLength={2000} />
            </label>
          </SmartForm>
        </details>
      )}
      <section className="section">
        <h2>Jejak keputusan</h2>
        {decisions?.map((d) => (
          <div className="notice" key={d.id}>
            <strong>
              {(
                {
                  publish: 'Dipublikasikan',
                  request_changes: 'Perlu perbaikan',
                  reject: 'Ditolak',
                  withdraw: 'Publikasi ditarik',
                  submit: 'Diajukan',
                  cancel: 'Pengajuan ditarik',
                } as Record<string, string>
              )[d.action] ?? d.action}
            </strong>{' '}
            · {formatDate(d.created_at)}
            <p className="keep-lines" style={{ margin: 0 }}>
              {d.note}
            </p>
            <span className="small muted">ID pengambil keputusan: {d.actor_id}</span>
          </div>
        ))}
      </section>
    </>
  );
}
