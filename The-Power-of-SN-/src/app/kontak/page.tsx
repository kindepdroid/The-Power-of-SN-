import { organization, whatsapp } from '@/lib/data';
export const metadata = { title: 'Kemitraan & kontak' };
export const dynamic = 'force-dynamic';
export default async function Page() {
  const org = await organization();
  return (
    <div className="container narrow">
      <header className="page-head">
        <div className="eyebrow">Terhubung</div>
        <h1>Kemitraan & kontak</h1>
        <p>Hubungi Sahabat Nusa untuk informasi organisasi, kegiatan, dan peluang kerja sama.</p>
      </header>
      <div className="card">
        {org.email && (
          <p>
            <strong>Email</strong>
            <br />
            <a href={'mailto:' + org.email}>{org.email}</a>
          </p>
        )}
        {org.phone && (
          <p>
            <strong>WhatsApp resmi</strong>
            <br />
            <a
              className="button"
              href={whatsapp(org.phone)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Hubungi {org.phone}
            </a>
          </p>
        )}
        {!org.email && !org.phone && <p className="muted">Kontak resmi sedang disiapkan.</p>}
      </div>
    </div>
  );
}
