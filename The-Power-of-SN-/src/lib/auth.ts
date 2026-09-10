import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient, configured } from './supabase/server';
import { isEditor } from './validation';
import type { Profile } from './types';
export const requireUser = cache(async () => {
  if (!configured()) redirect('/masuk');
  const db = await createClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user || !user.email_confirmed_at) redirect('/masuk');
  const { data, error } = await db.from('profiles').select('*').eq('id', user.id).single();
  if (error || !data?.active) redirect('/masuk?status=inactive');
  return { db, user, profile: data as Profile };
});
export async function requireEditor() {
  const result = await requireUser();
  if (!isEditor(result.profile.role)) redirect('/dashboard');
  return result;
}
export async function requireSuper() {
  const result = await requireUser();
  if (result.profile.role !== 'super_admin') redirect('/dashboard');
  return result;
}
