import { content } from '@/lib/data';
import { ContentCard, Empty } from '@/components/public';
export const metadata = { title: 'Program & kegiatan' };
export const dynamic = 'force-dynamic';
export default async function Page() {
  const items = await content();
  return (
    <div className="container">
      <header className="page-head">
        <div className="eyebrow">Keterlibatan</div>
        <h1>Program & kegiatan</h1>
        <p>
          Untuk informasi lanjutan atau pendaftaran kegiatan, hubungi kontak pengurus yang
          tercantum.
        </p>
      </header>
      {(['program', 'activity'] as const).map((kind) => (
        <section className="section" key={kind}>
          <h2>{kind === 'program' ? 'Program kami' : 'Dokumentasi kegiatan'}</h2>
          {items.some((i) => i.kind === kind) ? (
            <div className="grid">
              {items
                .filter((i) => i.kind === kind)
                .map((item) => (
                  <ContentCard key={item.id} item={item} />
                ))}
            </div>
          ) : (
            <Empty title="Belum ada informasi yang dipublikasikan" />
          )}
        </section>
      ))}
    </div>
  );
}
