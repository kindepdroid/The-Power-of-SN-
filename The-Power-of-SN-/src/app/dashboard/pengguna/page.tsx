import { requireEditor } from '@/lib/auth';
import { SmartForm } from '@/components/forms';
import { changeAccess } from '@/app/actions';
import type { Profile } from '@/lib/types';
export default async function Page() {
  const { db, profile } = await requireEditor();
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (
    <>
      <h1>Data kontributor</h1>
      <p className="muted">
        Kontak ini hanya untuk koordinasi internal. Pengaturan peran dan penonaktifan hanya tersedia
        bagi Super Admin.
      </p>
      <div className="stack">
        {(data as Profile[]).map((p) => (
          <article className="card" key={p.id}>
            <h3>{p.name}</h3>
            <p className="small keep-lines">
              {p.institution}
              {p.education ? ' · ' + p.education : ''}
              <br />
              {p.phone}
            </p>
            <p>
              <span className="badge">
                {p.role === 'super_admin'
                  ? 'Super Admin'
                  : p.role === 'database_admin'
                    ? 'Admin Database'
                    : 'Kontributor'}
              </span>{' '}
              <span className="small muted">{p.active ? 'Aktif' : 'Nonaktif'}</span>
            </p>
            {Object.entries(p.social_links).map(([k, v]) => (
              <p className="small" key={k}>
                {k}: <span className="keep-lines">{v}</span>
              </p>
            ))}
            {profile.role === 'super_admin' && p.id !== profile.id && (
              <details className="details">
                <summary>Ubah akses</summary>
                <SmartForm
                  action={changeAccess}
                  submit="Simpan akses"
                  confirm="Ubah hak akses akun ini?"
                >
                  <input type="hidden" name="id" value={p.id} />
                  <label>
                    Peran
                    <select name="role" defaultValue={p.role}>
                      <option value="contributor">Kontributor</option>
                      <option value="database_admin">Admin Database</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </label>
                  <label className="check">
                    <input name="active" type="checkbox" defaultChecked={p.active} />
                    <span>Akun aktif</span>
                  </label>
                </SmartForm>
              </details>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
