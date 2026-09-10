import { Field } from './forms';
import { socialPlatforms } from '@/lib/validation';
import type { Profile } from '@/lib/types';
export function AccountFields({ profile }: { profile?: Profile }) {
  return (
    <>
      <div className="form-row">
        <Field label="Nama lengkap *" name="name" required maxLength={100} value={profile?.name} />
        <Field
          label="Nomor HP *"
          name="phone"
          type="tel"
          required
          maxLength={25}
          value={profile?.phone}
          help="Untuk koordinasi internal dengan admin."
        />
      </div>
      <Field
        label="Instansi / afiliasi *"
        name="institution"
        required
        maxLength={160}
        value={profile?.institution}
      />
      <Field
        label="Pendidikan (opsional)"
        name="education"
        maxLength={200}
        value={profile?.education}
        help="Isi bebas, misalnya S1 Hukum atau mahasiswa semester 6."
      />
      <details className="details">
        <summary>Media sosial (opsional)</summary>
        <div className="form">
          {socialPlatforms.map((p) => (
            <Field
              key={p}
              label={p}
              name={p}
              type="url"
              maxLength={300}
              value={profile?.social_links[p]}
              help="Gunakan tautan lengkap https://…"
            />
          ))}
        </div>
      </details>
    </>
  );
}
