import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requireUser } from '@/lib/auth';
import { authorArticle } from '@/lib/data';
import { editable, isEditor } from '@/lib/validation';
import { ArticleForm } from '@/components/article-form';
import { SmartForm } from '@/components/forms';
import { Markdown, statusLabels, formatDate } from '@/components/public';
import { transition, revise } from '@/app/actions';
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const { db, user, profile } = await requireUser();
  const record = await authorArticle(db, id);
  if (!record || record.article.author_id !== user.id) notFound();
  const { article: a, versions } = record;
  const v = versions.find((v) => v.status !== 'approved') ?? versions[0];
  if (!v) notFound();
  const { data: decisions, error } = await db
    .from('editorial_decisions')
    .select('id,action,note,created_at')
    .in(
      'version_id',
      versions.map((v) => v.id),
    )
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (
    <>
      <Link href="/dashboard" className="small muted">
        ← Artikel saya
      </Link>
      <h1 style={{ marginTop: 20 }}>Kelola tulisan</h1>
      {(await searchParams).saved && <div className="notice success">Draf tersimpan.</div>}
      <p>
        <span className={'badge ' + v.status}>{statusLabels[v.status]}</span>
      </p>
      {a.published_version_id && (
        <div className="notice">
          {a.withdrawn
            ? 'Publikasi sedang ditarik.'
            : 'Versi sebelumnya tetap tayang selama revisi diperiksa.'}{' '}
          {!a.withdrawn && <Link href={'/publikasi/' + a.slug}>Lihat versi publik →</Link>}
        </div>
      )}
      {editable(v.status) ? (
        <ArticleForm version={v} />
      ) : (
        <>
          <h2>{v.title}</h2>
          <Markdown body={v.body} />
        </>
      )}
      <div className="section stack">
        {v.status === 'draft' && (
          <SmartForm
            action={transition}
            submit={isEditor(profile.role) ? 'Publikasikan artikel' : 'Ajukan ke redaksi'}
            confirm={
              isEditor(profile.role)
                ? 'Terbitkan versi draf yang terakhir disimpan ke publik?'
                : 'Ajukan draf yang terakhir disimpan? Setelah diajukan, draf terkunci sampai ditarik atau diperiksa.'
            }
          >
            <input type="hidden" name="version" value={v.id} />
            <input type="hidden" name="expected" value={v.lock_version} />
            <input
              type="hidden"
              name="action"
              value={isEditor(profile.role) ? 'publish' : 'submit'}
            />
            <p className="small muted">
              Tindakan ini memakai versi yang terakhir disimpan. Simpan perubahan di atas terlebih
              dahulu.
            </p>
          </SmartForm>
        )}
        {v.status === 'submitted' && (
          <SmartForm action={transition} submit="Tarik pengajuan untuk diedit">
            <input type="hidden" name="version" value={v.id} />
            <input type="hidden" name="expected" value={v.lock_version} />
            <input type="hidden" name="action" value="cancel" />
          </SmartForm>
        )}
        {v.status === 'approved' && (
          <SmartForm action={revise} submit="Buat draf revisi">
            <input type="hidden" name="id" value={a.id} />
          </SmartForm>
        )}
      </div>
      <h2>Catatan redaksi</h2>
      {decisions?.length ? (
        decisions.map((d) => (
          <div key={d.id} className="notice">
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
            {d.note && (
              <p className="keep-lines" style={{ marginBottom: 0 }}>
                {d.note}
              </p>
            )}
          </div>
        ))
      ) : (
        <p className="muted">Belum ada catatan.</p>
      )}
    </>
  );
}
