import Link from 'next/link';
import { SmartForm, Field } from '@/components/forms';
import { AccountFields } from '@/components/account-fields';
import { signUp } from '../actions';
import { configured } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Daftar kontributor', robots: { index: false, follow: false } };
export default function Page() {
  return (
    <div className="container auth">
      <div className="eyebrow">Akun kontributor</div>
      <h1>Mulai berkontribusi</h1>
      <p className="muted">
        Nama penulis akan tampil pada artikel. Kontak dan afiliasi akun digunakan secara internal.
      </p>
      {!configured() ? (
        <div className="notice">Pendaftaran belum dibuka. Layanan akun sedang disiapkan.</div>
      ) : (
        <SmartForm action={signUp} submit="Daftar dan verifikasi email">
          <AccountFields />
          <Field label="Email *" name="email" type="email" required maxLength={254} />
          <Field
            label="Password *"
            name="password"
            type="password"
            required
            minLength={12}
            maxLength={128}
            help="Minimal 12 karakter. Gunakan password yang unik."
          />
          <label className="check">
            <input name="consent" type="checkbox" required />
            <span>
              Saya memahami <Link href="/kebijakan-privasi">penggunaan data akun</Link> dan
              menyetujui <Link href="/pedoman">pedoman publikasi</Link>.
            </span>
          </label>
        </SmartForm>
      )}
      <p className="small" style={{ marginTop: 25 }}>
        Sudah memiliki akun? <Link href="/masuk">Masuk di sini</Link>.
      </p>
    </div>
  );
}
