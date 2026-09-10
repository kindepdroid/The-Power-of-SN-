import { createClient, configured } from './supabase/server';
import type { Article, ArticleVersion, ContentItem, Organization, PublicArticle } from './types';
export const emptyOrg: Organization = {
  id: 1,
  profile: '',
  vision: '',
  mission: '',
  email: '',
  phone: '',
  logo_url: '',
  lock_version: 0,
};
export async function organization() {
  if (!configured()) return emptyOrg;
  const db = await createClient();
  const { data, error } = await db.from('organization').select('*').eq('id', 1).single();
  if (error) throw new Error('Profil organisasi belum dapat dimuat.');
  return data as Organization;
}
export async function content(kind?: string) {
  if (!configured()) return [];
  const db = await createClient();
  let q = db.from('content_items').select('*').eq('visible', true).order('sort_order');
  if (kind) q = q.eq('kind', kind);
  const { data, error } = await q;
  if (error) throw new Error('Konten belum dapat dimuat.');
  return data as ContentItem[];
}
export async function listPublicArticles({
  q = '',
  category = '',
  page = 1,
  pageSize = 12,
}: { q?: string; category?: string; page?: number; pageSize?: number } = {}) {
  if (!configured()) return { articles: [] as PublicArticle[], count: 0 };
  const db = await createClient();
  let query = db
    .from('published_articles')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false })
    .order('id');
  if (category) query = query.eq('category', category);
  // Only literal words are used in the PostgREST OR expression; query syntax is discarded.
  const search = q
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .trim()
    .slice(0, 200);
  if (search)
    query = query.or(
      `title.ilike.%${search}%,summary.ilike.%${search}%,author_name.ilike.%${search}%`,
    );
  const { data, error, count } = await query.range((page - 1) * pageSize, page * pageSize - 1);
  if (error) throw new Error('Publikasi belum dapat dimuat.');
  return { articles: data as PublicArticle[], count: count ?? 0 };
}
export async function publicArticles(limit?: number): Promise<PublicArticle[]> {
  if (limit) return (await listPublicArticles({ pageSize: limit })).articles;
  const all: PublicArticle[] = [];
  let page = 1;
  while (true) {
    const result = await listPublicArticles({ page, pageSize: 500 });
    all.push(...result.articles);
    if (all.length >= result.count || result.articles.length === 0) break;
    page++;
  }
  return all;
}
export async function publicArticle(slug: string): Promise<PublicArticle | null> {
  if (!configured()) return null;
  const db = await createClient();
  const { data, error } = await db
    .from('published_articles')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw new Error('Artikel belum dapat dimuat.');
  return data as PublicArticle | null;
}
export async function authorArticle(db: Awaited<ReturnType<typeof createClient>>, id: string) {
  const { data: a, error } = await db.from('articles').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error('Artikel tidak dapat dimuat.');
  if (!a) return null;
  const { data: versions, error: ve } = await db
    .from('article_versions')
    .select('*')
    .eq('article_id', id)
    .order('created_at', { ascending: false });
  if (ve) throw new Error('Versi artikel tidak dapat dimuat.');
  return { article: a as Article, versions: versions as ArticleVersion[] };
}
export function whatsapp(phone: string) {
  let p = phone.replace(/\D/g, '');
  if (p.startsWith('0')) p = '62' + p.slice(1);
  return `https://wa.me/${p}`;
}
