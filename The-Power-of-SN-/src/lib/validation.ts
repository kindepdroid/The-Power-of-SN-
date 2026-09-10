import { z } from 'zod';
export const categories = ['Opini', 'Kajian Hukum', 'Policy Brief'] as const;
export const socialPlatforms = [
  'Instagram',
  'TikTok',
  'Threads',
  'YouTube',
  'LinkedIn',
  'Facebook',
] as const;
const socialHosts: Record<string, string[]> = {
  Instagram: ['instagram.com'],
  TikTok: ['tiktok.com'],
  Threads: ['threads.com', 'threads.net'],
  YouTube: ['youtube.com', 'youtu.be'],
  LinkedIn: ['linkedin.com'],
  Facebook: ['facebook.com', 'fb.com'],
};
export function safeSocial(platform: string, value: string) {
  if (!value) return true;
  try {
    const u = new URL(value);
    return (
      u.protocol === 'https:' &&
      !u.username &&
      !u.password &&
      (socialHosts[platform] ?? []).some((h) => u.hostname === h || u.hostname.endsWith('.' + h))
    );
  } catch {
    return false;
  }
}
export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ()-]{8,25}$/, 'Isi nomor HP yang valid.'),
  institution: z.string().trim().min(2, 'Isi instansi atau afiliasi.').max(160),
  education: z.string().trim().max(200).default(''),
  social_links: z
    .record(z.string(), z.string().trim().max(300))
    .refine(
      (v) =>
        Object.keys(v).every(
          (k) =>
            socialPlatforms.includes(k as (typeof socialPlatforms)[number]) && safeSocial(k, v[k]),
        ),
      'Tautan media sosial harus berupa URL HTTPS dari platform yang sesuai.',
    ),
});
export const registerSchema = profileSchema.extend({
  email: z.email('Email tidak valid.').max(254),
  password: z.string().min(12, 'Password minimal 12 karakter.').max(128),
});
export const articleSchema = z.object({
  title: z.string().trim().min(5, 'Judul minimal 5 karakter.').max(180),
  summary: z.string().trim().min(20, 'Ringkasan minimal 20 karakter.').max(400),
  body: z.string().trim().min(50, 'Artikel minimal 50 karakter.').max(60000),
  category: z.enum(categories),
});
export const isEditor = (role: string) => role === 'database_admin' || role === 'super_admin';
export const editable = (status: string) =>
  ['draft', 'changes_requested', 'rejected'].includes(status);
export function safePath(value: string | null, fallback = '/dashboard') {
  return value?.startsWith('/') && !value.startsWith('//') && !value.includes('\\')
    ? value
    : fallback;
}
export function mediaURL(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    const base = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://invalid.local');
    return (
      url.origin === base.origin &&
      url.pathname.startsWith('/storage/v1/object/public/media/') &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}
export const contentSchema = z.object({
  kind: z.enum(['program', 'activity', 'officer']),
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().min(2).max(12000),
  image_url: z
    .string()
    .max(1000)
    .refine(mediaURL, 'Gunakan URL gambar dari pustaka media website.'),
  contact: z
    .string()
    .trim()
    .max(30)
    .refine((v) => !v || /^\+?[0-9 ()-]{8,25}$/.test(v), 'Nomor kontak tidak valid.'),
  event_date: z.string().refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v)),
  visible: z.boolean(),
  sort_order: z.number().int().min(0).max(9999),
});
export const organizationSchema = z.object({
  profile: z.string().trim().max(12000),
  vision: z.string().trim().max(3000),
  mission: z.string().trim().max(5000),
  email: z.string().refine((v) => !v || z.email().safeParse(v).success, 'Email tidak valid.'),
  phone: z.string().refine((v) => !v || /^\+?[0-9 ()-]{8,25}$/.test(v), 'Nomor tidak valid.'),
  logo_url: z.string().max(1000).refine(mediaURL, 'Gunakan URL logo dari pustaka media.'),
});
