import { SmartForm, Field } from '@/components/forms';
import { recover } from '../actions';
export const metadata = { title: 'Pulihkan akun', robots: { index: false, follow: false } };
export default function Page() {
  return (
    <div className="container auth">
      <h1>Pulihkan akun</h1>
      <p className="muted">Masukkan email yang digunakan saat mendaftar.</p>
      <SmartForm action={recover} submit="Kirim tautan pemulihan">
        <Field label="Email" name="email" type="email" required />
      </SmartForm>
    </div>
  );
}
