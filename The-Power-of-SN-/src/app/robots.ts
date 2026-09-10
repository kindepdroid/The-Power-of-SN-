import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/auth', '/masuk', '/daftar', '/lupa-password', '/atur-password'],
    },
    ...(process.env.NEXT_PUBLIC_SITE_URL
      ? { sitemap: new URL('/sitemap.xml', process.env.NEXT_PUBLIC_SITE_URL).href }
      : {}),
  };
}
