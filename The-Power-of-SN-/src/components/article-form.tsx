import { SmartForm, Field } from './forms';
import { saveArticle } from '@/app/actions';
import { categories } from '@/lib/validation';
import type { ArticleVersion } from '@/lib/types';
export function ArticleForm({ version: v }: { version?: ArticleVersion }) {
  return (
    <SmartForm action={saveArticle} submit="Simpan draf">
      <input type="hidden" name="id" value={v?.article_id ?? ''} />
      <input type="hidden" name="version" value={v?.id ?? ''} />
      <input type="hidden" name="expected" value={v?.lock_version ?? 0} />
      <Field
        label="Judul artikel"
        name="title"
        required
        minLength={5}
        maxLength={180}
        value={v?.title}
      />
      <label>
        Kategori
        <select name="category" defaultValue={v?.category ?? 'Opini'}>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label>
        Ringkasan
        <textarea
          name="summary"
          defaultValue={v?.summary}
          required
          minLength={20}
          maxLength={400}
        />
        <span className="help">20–400 karakter. Ditampilkan dalam daftar publikasi.</span>
      </label>
      <label>
        Isi artikel
        <textarea
          className="editor"
          name="body"
          defaultValue={v?.body}
          required
          minLength={50}
          maxLength={60000}
        />
        <span className="help">
          Gunakan Markdown: ## Subjudul, **tebal**, dan [nama sumber](https://…). HTML dan gambar
          dalam isi tidak ditampilkan. Simpan draf sebelum meninggalkan halaman.
        </span>
      </label>
    </SmartForm>
  );
}
