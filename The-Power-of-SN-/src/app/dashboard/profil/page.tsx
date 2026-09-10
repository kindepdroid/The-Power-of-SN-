import { requireUser } from '@/lib/auth';
import { SmartForm } from '@/components/forms';
import { AccountFields } from '@/components/account-fields';
import { saveProfile } from '@/app/actions';
export default async function Page() {
  const { profile, user } = await requireUser();
  return (
    <>
      <h1>Profil akun</h1>
      <p className="muted">Email terverifikasi: {user.email}</p>
      <SmartForm action={saveProfile}>
        <AccountFields profile={profile} />
      </SmartForm>
    </>
  );
}
