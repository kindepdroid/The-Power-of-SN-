'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient, configured } from '@/lib/supabase/server';
import { requireUser, requireEditor, requireSuper } from '@/lib/auth';
import {
  profileSchema,
  registerSchema,
  articleSchema,
  contentSchema,
  organizationSchema,
  socialPlatforms,
} from '@/lib/validation';
import type { FormState } from '@/lib/types';
const text = (d: FormData, k: string) => String(d.get(k) ?? '');
const profileData = (d: FormData) => ({
  name: text(d, 'name'),
  phone: text(d, 'phone'),
  institution: text(d, 'institution'),
  education: text(d, 'education'),
  social_links: Object.fromEntries(
    socialPlatforms.map((p) => [p, text(d, p)]).filter(([, v]) => v),
  ),
});
const issue = (e: z.ZodError) => ({
  error: e.issues[0]?.message ?? 'Periksa kembali isian formulir.',
});
function failure(error: { message: string } | null): FormState {
  if (!error) return {};
  const message = error.message;
  return {
    error: message.includes('CONFLICT')
      ? 'Data telah berubah. Muat ulang halaman sebelum melanjutkan. Salin tulisanmu terlebih dahulu.'
      : message.includes('NOTE_REQUIRED')
        ? 'Isi alasan atau catatan pemeriksaan.'
        : message.includes('FORBIDDEN') || message.includes('INVALID_STATE')
          ? 'Tindakan tidak diizinkan untuk akun atau status ini.'
          : 'Perubahan belum tersimpan. Periksa isian atau coba lagi.',
  };
}
export async function signUp(_: FormState, d: FormData): Promise<FormState> {
  if (!configured()) return { error: 'Pendaftaran belum dibuka. Layanan akun sedang disiapkan.' };
  if (text(d, 'consent') !== 'on')
    return { error: 'Setujui pedoman dan penggunaan data terlebih dahulu.' };
  const parsed = registerSchema.safeParse({
    ...profileData(d),
    email: text(d, 'email').trim().toLowerCase(),
    password: text(d, 'password'),
  });
  if (!parsed.success) return issue(parsed.error);
  const { email, password, ...data } = parsed.data;
  const db = await createClient();
  const { error } = await db.auth.signUp({ email, password, options: { data } });
  if (error)
    return {
      error:
        'Pendaftaran belum berhasil. Periksa isian dan coba lagi. Jika sudah memiliki akun, gunakan menu masuk atau pemulihan password.',
    };
  return {
    success:
      'Periksa email untuk memverifikasi akun. Jika email sudah terdaftar, gunakan menu masuk atau pemulihan password.',
  };
}
export async function signIn(_: FormState, d: FormData): Promise<FormState> {
  if (!configured()) return { error: 'Layanan akun sedang disiapkan.' };
  const parsed = z
    .object({ email: z.email(), password: z.string().min(1).max(128) })
    .safeParse({ email: text(d, 'email').trim(), password: text(d, 'password') });
  if (!parsed.success) return { error: 'Isi email dan password dengan benar.' };
  const db = await createClient();
  const { error } = await db.auth.signInWithPassword(parsed.data);
  if (error)
    return { error: 'Tidak dapat masuk. Periksa email, password, dan verifikasi emailmu.' };
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user?.email_confirmed_at) {
    await db.auth.signOut();
    return { error: 'Verifikasi email terlebih dahulu.' };
  }
  const { data: p } = await db.from('profiles').select('active').eq('id', user.id).maybeSingle();
  if (!p?.active) {
    await db.auth.signOut();
    return { error: 'Akun tidak aktif atau profil belum tersedia. Hubungi pengelola.' };
  }
  redirect('/dashboard');
}
export async function signOut() {
  const db = await createClient();
  await db.auth.signOut();
  redirect('/masuk');
}
export async function recover(_: FormState, d: FormData): Promise<FormState> {
  if (!configured()) return { error: 'Layanan akun sedang disiapkan.' };
  const email = text(d, 'email').trim();
  if (!z.email().safeParse(email).success) return { error: 'Isi email yang valid.' };
  const db = await createClient();
  const { error } = await db.auth.resetPasswordForEmail(email);
  if (error) return { error: 'Permintaan belum dapat diproses. Coba lagi beberapa saat.' };
  return { success: 'Jika akun tersedia, tautan pemulihan dikirim ke email tersebut.' };
}
export async function resend(_: FormState, d: FormData): Promise<FormState> {
  if (!configured()) return { error: 'Layanan akun sedang disiapkan.' };
  const email = text(d, 'email').trim();
  if (!z.email().safeParse(email).success) return { error: 'Isi email yang valid.' };
  const db = await createClient();
  const { error } = await db.auth.resend({ type: 'signup', email });
  if (error) return { error: 'Permintaan belum dapat diproses. Coba lagi beberapa saat.' };
  return { success: 'Jika akun menunggu verifikasi, email verifikasi akan dikirim kembali.' };
}
export async function resetPassword(_: FormState, d: FormData): Promise<FormState> {
  const { db } = await requireUser();
  const password = text(d, 'password');
  if (password.length < 12 || password.length > 128)
    return { error: 'Password harus 12–128 karakter.' };
  if (password !== text(d, 'confirm')) return { error: 'Konfirmasi password tidak sama.' };
  const { error } = await db.auth.updateUser({ password });
  if (error)
    return {
      error: 'Password belum dapat diubah. Minta tautan pemulihan baru jika sesi kedaluwarsa.',
    };
  await db.auth.signOut({ scope: 'global' });
  redirect('/masuk?status=password');
}
export async function saveProfile(_: FormState, d: FormData): Promise<FormState> {
  const { db } = await requireUser();
  const p = profileSchema.safeParse(profileData(d));
  if (!p.success) return issue(p.error);
  const v = p.data;
  const { error } = await db.rpc('update_profile', {
    p_name: v.name,
    p_phone: v.phone,
    p_institution: v.institution,
    p_education: v.education,
    p_social_links: v.social_links,
  });
  if (error) return failure(error);
  revalidatePath('/dashboard', 'layout');
  return {
    success: 'Profil diperbarui. Nama pada versi artikel yang sudah dibuat tidak berubah otomatis.',
  };
}
export async function saveArticle(_: FormState, d: FormData): Promise<FormState> {
  const { db } = await requireUser();
  const p = articleSchema.safeParse({
    title: text(d, 'title'),
    summary: text(d, 'summary'),
    body: text(d, 'body'),
    category: text(d, 'category'),
  });
  if (!p.success) return issue(p.error);
  const ids = z
    .object({
      id: z.uuid().nullable(),
      version: z.uuid().nullable(),
      expected: z.number().int().nonnegative(),
    })
    .safeParse({
      id: text(d, 'id') || null,
      version: text(d, 'version') || null,
      expected: Number(text(d, 'expected')),
    });
  if (!ids.success) return { error: 'Identitas artikel tidak valid.' };
  const v = p.data;
  const { data: id, error } = await db.rpc('save_article', {
    p_article: ids.data.id,
    p_version: ids.data.version,
    p_expected: ids.data.expected,
    p_title: v.title,
    p_summary: v.summary,
    p_body: v.body,
    p_category: v.category,
  });
  if (error) return failure(error);
  revalidatePath('/dashboard', 'layout');
  redirect('/dashboard/artikel/' + id + '?saved=1');
}
export async function revise(_: FormState, d: FormData): Promise<FormState> {
  const { db } = await requireUser();
  const id = text(d, 'id');
  if (!z.uuid().safeParse(id).success) return { error: 'Artikel tidak valid.' };
  const { error } = await db.rpc('start_revision', { p_article: id });
  if (error) return failure(error);
  revalidatePath('/dashboard', 'layout');
  redirect('/dashboard/artikel/' + id);
}
export async function transition(_: FormState, d: FormData): Promise<FormState> {
  const { db } = await requireUser();
  const p = z
    .object({
      version: z.uuid(),
      expected: z.number().int().nonnegative(),
      action: z.enum(['submit', 'cancel', 'publish', 'request_changes', 'reject', 'withdraw']),
      note: z.string().trim().max(2000),
    })
    .safeParse({
      version: text(d, 'version'),
      expected: Number(text(d, 'expected')),
      action: text(d, 'action'),
      note: text(d, 'note'),
    });
  if (!p.success) return issue(p.error);
  const v = p.data;
  const { error } = await db.rpc('transition_article', {
    p_version: v.version,
    p_expected: v.expected,
    p_action: v.action,
    p_note: v.note,
  });
  if (error) return failure(error);
  revalidatePath('/', 'layout');
  return { success: 'Status artikel diperbarui.' };
}
export async function saveOrganization(_: FormState, d: FormData): Promise<FormState> {
  const { db } = await requireEditor();
  const p = organizationSchema.safeParse(
    Object.fromEntries(
      ['profile', 'vision', 'mission', 'email', 'phone', 'logo_url'].map((k) => [k, text(d, k)]),
    ),
  );
  if (!p.success) return issue(p.error);
  const expected = Number(text(d, 'expected'));
  if (!Number.isInteger(expected) || expected < 0) return { error: 'Versi data tidak valid.' };
  const v = p.data;
  const { error } = await db.rpc('save_organization', {
    p_expected: expected,
    p_profile: v.profile,
    p_vision: v.vision,
    p_mission: v.mission,
    p_email: v.email,
    p_phone: v.phone,
    p_logo_url: v.logo_url,
  });
  if (error) return failure(error);
  revalidatePath('/', 'layout');
  return { success: 'Profil organisasi diperbarui.' };
}
export async function saveContent(_: FormState, d: FormData): Promise<FormState> {
  const { db } = await requireEditor();
  const p = contentSchema.safeParse({
    ...Object.fromEntries(
      ['kind', 'title', 'description', 'image_url', 'contact', 'event_date'].map((k) => [
        k,
        text(d, k),
      ]),
    ),
    visible: text(d, 'visible') === 'on',
    sort_order: Number(text(d, 'sort_order')),
  });
  if (!p.success) return issue(p.error);
  const id = text(d, 'id') || null;
  const expected = Number(text(d, 'expected'));
  if ((id && !z.uuid().safeParse(id).success) || !Number.isInteger(expected) || expected < 0)
    return { error: 'Identitas konten tidak valid.' };
  const v = p.data;
  const { error } = await db.rpc('save_content', {
    p_id: id,
    p_expected: expected,
    p_kind: v.kind,
    p_title: v.title,
    p_description: v.description,
    p_image_url: v.image_url,
    p_contact: v.contact,
    p_event_date: v.event_date || null,
    p_visible: v.visible,
    p_sort_order: v.sort_order,
  });
  if (error) return failure(error);
  revalidatePath('/', 'layout');
  redirect('/dashboard/konten?saved=1');
}
export async function changeAccess(_: FormState, d: FormData): Promise<FormState> {
  const { db } = await requireSuper();
  const p = z
    .object({ id: z.uuid(), role: z.enum(['contributor', 'database_admin', 'super_admin']) })
    .safeParse({ id: text(d, 'id'), role: text(d, 'role') });
  if (!p.success) return issue(p.error);
  const { error } = await db.rpc('update_access', {
    p_target: p.data.id,
    p_role: p.data.role,
    p_active: text(d, 'active') === 'on',
  });
  if (error) return failure(error);
  revalidatePath('/dashboard', 'layout');
  return { success: 'Hak akses diperbarui dan tercatat.' };
}
export async function uploadImage(_: FormState, d: FormData): Promise<FormState> {
  const { db, user } = await requireEditor();
  const file = d.get('file');
  if (!(file instanceof File) || file.size === 0 || file.size > 5 * 1024 * 1024)
    return { error: 'Pilih gambar JPG, PNG, atau WebP maksimal 5 MB.' };
  const b = new Uint8Array(await file.arrayBuffer());
  let ext = '';
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) ext = 'jpg';
  else if ([137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => b[i] === v)) ext = 'png';
  else if (
    new TextDecoder().decode(b.slice(0, 4)) === 'RIFF' &&
    new TextDecoder().decode(b.slice(8, 12)) === 'WEBP'
  )
    ext = 'webp';
  if (!ext) return { error: 'Format gambar tidak dikenali. Gunakan JPG, PNG, atau WebP.' };
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await db.storage
    .from('media')
    .upload(path, b, { contentType: ext === 'jpg' ? 'image/jpeg' : `image/${ext}`, upsert: false });
  if (error) return { error: 'Gambar belum berhasil diunggah.' };
  const { data } = db.storage.from('media').getPublicUrl(path);
  return { success: 'Gambar diunggah. Salin URL ini ke isian gambar atau logo: ' + data.publicUrl };
}
