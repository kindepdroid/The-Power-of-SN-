import Link from 'next/link';
import { publicArticles, content } from '@/lib/data';
import { ArticleCard, ContentCard, Empty } from '@/components/public';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const [articles, items] = await Promise.all([publicArticles(3), content()]);
  const programs = items.filter((i) => i.kind === 'program');
  const activities = items.filter((i) => i.kind === 'activity');
  return (
    <div className="container">
      <section className="hero">
        <div>
          <div className="eyebrow">Ruang Sahabat Nusa</div>
          <h1>
            Gagasan bertemu.
            <br />
            Kontribusi tumbuh.
          </h1>
          <p>
            Ruang bagi mahasiswa dan akademisi untuk berbagi kajian, membangun percakapan, dan
            mengenal kegiatan Sahabat Nusa.
          </p>
          <div className="actions">
            <Link className="button" href="/publikasi">
              Jelajahi publikasi
            </Link>
            <Link className="button secondary" href="/tentang">
              Kenali kami
            </Link>
          </div>
        </div>
        <aside className="hero-aside">
          <div className="eyebrow">Kenali ruang kami</div>
          <h2>
            Dari pemikiran
            <br />
            ke keterlibatan.
          </h2>
          <div className="index-row">
            <span>01</span>
            <div>
              <Link href="/publikasi">
                <strong>Kajian & perspektif</strong>
              </Link>
              <p>Opini, kajian hukum, dan policy brief.</p>
            </div>
          </div>
          <div className="index-row">
            <span>02</span>
            <div>
              <Link href="/program">
                <strong>Program & kegiatan</strong>
              </Link>
              <p>Temukan kegiatan dan hubungi pengurusnya.</p>
            </div>
          </div>
          <div className="index-row">
            <span>03</span>
            <div>
              <Link href="/kontribusi">
                <strong>Suara kontributor</strong>
              </Link>
              <p>Ajukan tulisan untuk diperiksa oleh redaksi.</p>
            </div>
          </div>
        </aside>
      </section>
      <section className="section">
        <div className="section-head">
          <h2>Publikasi terbaru</h2>
          <Link href="/publikasi">Semua publikasi →</Link>
        </div>
        {articles.length ? (
          <div className="grid">
            {articles.slice(0, 3).map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        ) : (
          <Empty title="Tulisan pertama sedang disiapkan">
            <p>Publikasi akan tersedia setelah melalui pemeriksaan redaksi.</p>
          </Empty>
        )}
      </section>
      <section className="section">
        <div className="section-head">
          <h2>Program Sahabat Nusa</h2>
          <Link href="/program">Lihat program →</Link>
        </div>
        {programs.length ? (
          <div className="grid">
            {programs.slice(0, 3).map((p) => (
              <ContentCard key={p.id} item={p} />
            ))}
          </div>
        ) : (
          <Empty title="Informasi program akan segera tersedia" />
        )}
      </section>
      {activities.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Catatan kegiatan</h2>
          </div>
          <div className="grid">
            {activities.slice(0, 3).map((p) => (
              <ContentCard key={p.id} item={p} />
            ))}
          </div>
        </section>
      )}
      <section className="band">
        <div>
          <h2>Punya gagasan untuk dibagikan?</h2>
          <p>Mulai dari satu tulisan. Bergabung sebagai kontributor.</p>
        </div>
        <Link href="/kontribusi" className="button">
          Menjadi kontributor
        </Link>
      </section>
    </div>
  );
}
