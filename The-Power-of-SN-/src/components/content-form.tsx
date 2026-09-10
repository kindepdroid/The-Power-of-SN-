import { SmartForm, Field } from './forms';
import { saveContent } from '@/app/actions';
import type { ContentItem } from '@/lib/types';
export function ContentForm({ item: i }: { item?: ContentItem }) {
  return (
    <SmartForm action={saveContent}>
      <input type="hidden" name="id" value={i?.id ?? ''} />
      <input type="hidden" name="expected" value={i?.lock_version ?? 0} />
      <label>
        Jenis konten
        <select name="kind" defaultValue={i?.kind ?? 'program'}>
          <option value="program">Program</option>
          <option value="activity">Dokumentasi kegiatan</option>
          <option value="officer">Pengurus</option>
        </select>
      </label>
      <Field label="Judul / nama pengurus" name="title" value={i?.title} required maxLength={180} />
      <label>
        Deskripsi / jabatan pengurus
        <textarea
          name="description"
          defaultValue={i?.description}
          required
          minLength={2}
          maxLength={12000}
        />
      </label>
      <Field
        label="URL gambar (opsional)"
        name="image_url"
        type="url"
        value={i?.image_url}
        maxLength={1000}
        help="Unggah gambar di Pustaka gambar, lalu salin URL-nya."
      />
      <div className="form-row">
        <Field
          label="Kontak publik (opsional)"
          name="contact"
          type="tel"
          value={i?.contact}
          maxLength={30}
        />
        <Field
          label="Tanggal kegiatan (opsional)"
          name="event_date"
          type="date"
          value={i?.event_date ?? ''}
        />
      </div>
      <Field
        label="Urutan tampil"
        name="sort_order"
        type="number"
        value={String(i?.sort_order ?? 0)}
        required
      />
      <label className="check">
        <input type="checkbox" name="visible" defaultChecked={i?.visible ?? false} />
        <span>Tampilkan kepada publik</span>
      </label>
    </SmartForm>
  );
}
