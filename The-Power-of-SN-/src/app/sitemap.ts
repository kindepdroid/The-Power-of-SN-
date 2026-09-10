import type { MetadataRoute } from 'next';
import { publicArticles } from '@/lib/data';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) return [];
  const list = await publicArticles();
  return [
    ...[
      '/',
      '/tentang',
      '/program',
      '/publikasi',
      '/kontak',
      '/kontribusi',
      '/pedoman',
      '/kebijakan-privasi',
    ].map((path) => ({ url: new URL(path, origin).href })),
    ...list.map((a) => ({
      url: new URL('/publikasi/' + a.slug, origin).href,
      lastModified: a.published_at ?? a.updated_at,
    })),
  ];
}
