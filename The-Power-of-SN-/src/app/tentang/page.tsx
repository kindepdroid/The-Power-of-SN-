import { organization, content } from '@/lib/data';
import { ContentCard, Empty } from '@/components/public';
export const metadata = { title: 'Tentang kami' };
export const dynamic = 'force-dynamic';
export default async function Page() {
  const [org, officers] = await Promise.all([organization(), content('officer')]);
  return (
    <div className="container">
      <header className="page-head">
        <div className="eyebrow">Tentang organisasi</div>
        <h1>Mengenal Sahabat Nusa</h1>
      </header>
      <section className="narrow">
        {org.logo_url && (
          <img className="organization-logo" src={org.logo_url} alt="Logo Sahabat Nusa" />
        )}
        {org.profile ? (
          <p className="prose keep-lines">{org.profile}</p>
        ) : (
          <Empty title="Profil organisasi sedang disiapkan" />
        )}
        {org.vision && (
          <>
            <h2>Visi</h2>
            <p className="keep-lines">{org.vision}</p>
          </>
        )}
        {org.mission && (
          <>
            <h2>Misi</h2>
            <p className="keep-lines">{org.mission}</p>
          </>
        )}
      </section>
      <section className="section">
        <h2>Pengurus</h2>
        {officers.length ? (
          <div className="grid">
            {officers.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <Empty title="Daftar pengurus belum dipublikasikan" />
        )}
      </section>
    </div>
  );
}
