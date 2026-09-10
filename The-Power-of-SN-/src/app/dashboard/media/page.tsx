import { requireEditor } from '@/lib/auth';
import { SmartForm } from '@/components/forms';
import { uploadImage } from '@/app/actions';
export default async function Page() {
  await requireEditor();
  return (
    <>
      <h1>Pustaka gambar</h1>
      <p className="muted">
        Unggah logo, foto pengurus, atau dokumentasi kegiatan. Hanya unggah gambar yang memang boleh
        dilihat publik.
      </p>
      <div className="notice">
        Gambar yang diunggah dapat diakses melalui URL publik, walaupun belum dipasang pada halaman.
        Jangan unggah dokumen internal atau data pribadi.
      </div>
      <SmartForm action={uploadImage} submit="Unggah gambar">
        <label>
          Pilih gambar
          <input type="file" name="file" accept="image/jpeg,image/png,image/webp" required />
          <span className="help">
            JPG, PNG, atau WebP. Maksimal 5 MB. Setelah berhasil, salin URL yang diberikan.
          </span>
        </label>
      </SmartForm>
    </>
  );
}
