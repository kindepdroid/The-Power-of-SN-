import Link from 'next/link';
import { requireEditor } from '@/lib/auth';
import { SmartForm, Field } from '@/components/forms';
import { ContentForm } from '@/components/content-form';
import { saveOrganization } from '@/app/actions';
import type { ContentItem, Organization } from '@/lib/types';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { db } = await requireEditor();
  const [{ data: o, error }, { data: items, error: ie }] = await Promise.all([
    db.from('organization').select('*').eq('id', 1).single(),
    db.from('content_items').select('*').order('kind').order('sort_order'),
  ]);
  if (error || ie) throw error || ie;
  const org = o as Organization;
  return (
    <>
      <h1>Konten organisasi</h1>
      <p className="muted">
        Kelola profil, pengurus, program, dan dokumentasi yang ditampilkan pada website.
      </p>
      {(await searchParams).saved && (
        <div className="notice success">Konten berhasil disimpan.</div>
      )}
      <div className="stack">
        <details className="details">
          <summary>Profil organisasi & kontak resmi</summary>
          <SmartForm key={org.lock_version} action={saveOrganization}>
            <input type="hidden" name="expected" value={org.lock_version} />
            <label>
              Profil organisasi
              <textarea name="profile" defaultValue={org.profile} maxLength={12000} />
            </label>
            <label>
              Visi
              <textarea name="vision" defaultValue={org.vision} maxLength={3000} />
            </label>
            <label>
              Misi
              <textarea name="mission" defaultValue={org.mission} maxLength={5000} />
            </label>
            <Field label="Email publik" name="email" type="email" value={org.email} />
            <Field label="Nomor WhatsApp resmi" name="phone" type="tel" value={org.phone} />
            <Field
              label="URL logo"
              name="logo_url"
              type="url"
              value={org.logo_url}
              help="Gunakan URL dari Pustaka gambar."
            />
          </SmartForm>
        </details>
        <details className="details">
          <summary>Tambah program, kegiatan, atau pengurus</summary>
          <ContentForm />
        </details>
        {(items as ContentItem[]).map((i) => (
          <details className="details" key={i.id + '-' + i.lock_version}>
            <summary>
              {i.title} <span className="badge">{i.visible ? 'Tampil' : 'Tersembunyi'}</span>
            </summary>
            <ContentForm item={i} />
          </details>
        ))}
      </div>
      <p className="small" style={{ marginTop: 25 }}>
        <Link href="/dashboard/media">Unggah gambar →</Link>
      </p>
    </>
  );
}
