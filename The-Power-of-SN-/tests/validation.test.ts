import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  articleSchema,
  profileSchema,
  registerSchema,
  safeSocial,
  safePath,
  isEditor,
  editable,
  mediaURL,
} from '../src/lib/validation';
const profile = {
  name: 'Penulis Satu',
  phone: '081234567890',
  institution: 'Universitas Contoh',
  education: '',
  social_links: {},
};
test('Education and socials optional, affiliation and phone mandatory', () => {
  assert.ok(profileSchema.safeParse(profile).success);
  assert.ok(!profileSchema.safeParse({ ...profile, institution: '' }).success);
  assert.ok(!profileSchema.safeParse({ ...profile, phone: '' }).success);
});
test('Social URLs must match claimed platform', () => {
  assert.ok(safeSocial('Instagram', 'https://www.instagram.com/penulis'));
  for (const url of [
    'javascript:alert(1)',
    'https://instagram.com.evil.test/a',
    'https://evil.test/?instagram.com',
    'https://user:password@instagram.com',
  ])
    assert.equal(safeSocial('Instagram', url), false);
});
test('No client-provided role accepted in registration schema', () => {
  const result = registerSchema.parse({
    ...profile,
    email: 'penulis@example.com',
    password: 'password-yang-panjang',
    role: 'super_admin',
  });
  assert.equal('role' in result, false);
});
test('Article limits and category validation', () => {
  assert.ok(
    !articleSchema.safeParse({ title: 'a', summary: 'b', body: 'c', category: 'other' }).success,
  );
});
test('Admin self-publishing permission covers both privileged roles', () => {
  assert.ok(isEditor('database_admin'));
  assert.ok(isEditor('super_admin'));
  assert.equal(isEditor('contributor'), false);
  assert.equal(editable('submitted'), false);
  assert.equal(editable('approved'), false);
});
test('External redirect paths are rejected', () => {
  assert.equal(safePath('//evil.test'), '/dashboard');
  assert.equal(safePath('https://evil.test'), '/dashboard');
  assert.equal(safePath('/\\evil.test'), '/dashboard');
  assert.equal(safePath('/dashboard/profil'), '/dashboard/profil');
});
test('Media URLs cannot point to third-party hosts', () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
  assert.ok(mediaURL('https://example.supabase.co/storage/v1/object/public/media/test.webp'));
  assert.equal(mediaURL('https://evil.test/test.webp'), false);
  assert.equal(mediaURL('javascript:alert(1)'), false);
});

test('Required fields cannot be bypassed with whitespace', () => {
  assert.equal(profileSchema.safeParse({ ...profile, name: '   ' }).success, false);
  assert.equal(profileSchema.safeParse({ ...profile, institution: '  ' }).success, false);
});
