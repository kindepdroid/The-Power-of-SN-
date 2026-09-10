import { ArticleForm } from '@/components/article-form';
import { requireUser } from '@/lib/auth';
export default async function Page() {
  await requireUser();
  return (
    <>
      <h1>Tulis artikel</h1>
      <p className="muted">
        Simpan sebagai draf terlebih dahulu. Mengajukan atau menerbitkan adalah tindakan terpisah.
      </p>
      <ArticleForm />
    </>
  );
}
