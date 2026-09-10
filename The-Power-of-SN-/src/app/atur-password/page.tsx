import { SmartForm, Field } from '@/components/forms';
import { resetPassword } from '../actions';
import { requireUser } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Password baru', robots: { index: false, follow: false } };
export default async function Page() {
  await requireUser();
  return (
    <div className="container auth">
      <h1>Atur password baru</h1>
      <SmartForm action={resetPassword} submit="Simpan password">
        <Field
          label="Password baru"
          name="password"
          type="password"
          required
          minLength={12}
          maxLength={128}
        />
        <Field
          label="Ulangi password"
          name="confirm"
          type="password"
          required
          minLength={12}
          maxLength={128}
        />
      </SmartForm>
    </div>
  );
}
