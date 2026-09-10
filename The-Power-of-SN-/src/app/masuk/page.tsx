import Link from 'next/link';
import { SmartForm, Field } from '@/components/forms';
import { signIn, resend } from '../actions';
import { configured } from '@/lib/supabase/server';
export const metadata = { title: 'Masuk', robots: { index: false, follow: false } };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const messages: Record<string, string> = {
    expired: 'Tautan tidak valid atau kedaluwarsa. Minta email baru.',
    password: 'Password berhasil diubah. Silakan masuk kembali.',
    inactive: 'Akun tidak aktif atau profil belum tersedia. Hubungi pengelola.',
  };
  return (
    <div className="container auth">
      <div className="eyebrow">Ruang kontributor</div>
      <h1>Selamat datang kembali.</h1>
      {status && messages[status] && <div className="notice">{messages[status]}</div>}
      {!configured() ? (
        <div className="notice">Layanan akun sedang disiapkan.</div>
      ) : (
        <>
          <SmartForm action={signIn} submit="Masuk">
            <Field label="Email" name="email" type="email" required />
            <Field label="Password" name="password" type="password" required maxLength={128} />
          </SmartForm>
          <div className="row small" style={{ marginBlock: 25 }}>
            <Link href="/lupa-password">Lupa password?</Link>
            <Link href="/daftar">Buat akun kontributor</Link>
          </div>
          <details className="details">
            <summary>Belum menerima email verifikasi?</summary>
            <SmartForm action={resend} submit="Kirim ulang email">
              <Field label="Email" name="email" type="email" required />
            </SmartForm>
          </details>
        </>
      )}
    </div>
  );
}
