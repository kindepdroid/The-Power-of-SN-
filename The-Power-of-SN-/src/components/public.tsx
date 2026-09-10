import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import type { PublicArticle, ContentItem } from '@/lib/types';
import { whatsapp } from '@/lib/data';
export function Markdown({ body }: { body: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        skipHtml
        disallowedElements={['img', 'iframe', 'script', 'style', 'input', 'form']}
        components={{
          a: ({ children, href }) => (
            <a href={href} rel="nofollow noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <div className="muted">{children}</div>
    </div>
  );
}
export function ArticleCard({ article: a }: { article: PublicArticle }) {
  return (
    <article className="article-card">
      <span className="badge">{a.category}</span>
      <h3>
        <Link href={'/publikasi/' + a.slug}>{a.title}</Link>
      </h3>
      <p>{a.summary}</p>
      <div className="small muted">
        {a.author_name} · {formatDate(a.published_at)}
      </div>
    </article>
  );
}
export function ContentCard({ item }: { item: ContentItem }) {
  return (
    <article className="card">
      {item.image_url && (
        <img className="content-image" src={item.image_url} alt={item.title} loading="lazy" />
      )}
      {item.event_date && <p className="small muted">{formatDate(item.event_date)}</p>}
      <h3>{item.title}</h3>
      <p className="keep-lines muted">{item.description}</p>
      {item.contact && (
        <a
          className="button secondary"
          href={whatsapp(item.contact)}
          target="_blank"
          rel="noopener noreferrer"
        >
          Hubungi pengurus
        </a>
      )}
    </article>
  );
}
export function formatDate(value: string | null) {
  return value
    ? new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Jakarta',
      }).format(new Date(value))
    : '';
}
export const statusLabels: Record<string, string> = {
  draft: 'Draf',
  submitted: 'Menunggu pemeriksaan',
  changes_requested: 'Perlu revisi',
  rejected: 'Ditolak',
  approved: 'Disetujui',
};
