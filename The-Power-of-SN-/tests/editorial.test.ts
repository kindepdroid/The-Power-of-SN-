import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
const A = '11111111-1111-4111-8111-111111111111',
  B = '22222222-2222-4222-8222-222222222222',
  E = '33333333-3333-4333-8333-333333333333',
  S = '44444444-4444-4444-8444-444444444444',
  U = '55555555-5555-4555-8555-555555555555';
const body =
  'Ini adalah isi kajian yang cukup panjang untuk memenuhi ketentuan minimal artikel. Sumber perlu diperiksa.';
test('Database integration: editorial lifecycle and RLS', async (t) => {
  const db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth; create schema storage;
 create table auth.users(id uuid primary key,email_confirmed_at timestamptz,raw_user_meta_data jsonb);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema public,auth,storage to anon,authenticated;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
 alter table storage.objects enable row level security;
 create function storage.foldername(name text) returns text[] language sql as $$select string_to_array(name,'/')$$;`);
  await db.exec(
    readFileSync(
      new URL('../supabase/migrations/202609100001_initial.sql', import.meta.url),
      'utf8',
    ),
  );
  for (const id of [A, B, E, S, U])
    await db.query(
      'insert into auth.users(id,email_confirmed_at,raw_user_meta_data) values($1,$2,$3)',
      [
        id,
        id === U ? null : new Date().toISOString(),
        JSON.stringify({
          name: 'Penulis ' + id[0],
          phone: '081234567890',
          institution: 'Kampus Contoh',
          role: 'super_admin',
        }),
      ],
    );
  await db.query("update public.profiles set role='database_admin' where id=$1", [E]);
  await db.query("update public.profiles set role='super_admin' where id=$1", [S]);
  const as = async (id: string | null, anon = false) => {
    await db.exec('reset role');
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id ?? '']);
    await db.exec('set role ' + (anon ? 'anon' : 'authenticated'));
  };
  const one = async (sql: string, params: unknown[] = []) => {
    const r = await db.query<Record<string, any>>(sql, params);
    return r.rows[0];
  };
  const version = async (id: string) =>
    one('select * from public.article_versions where article_id=$1 order by created_at desc', [id]);
  const create = async (title = 'Judul awal kajian') =>
    (
      await one('select public.save_article(null,null,0,$1,$2,$3,$4) as id', [
        title,
        'Ringkasan artikel yang mencukupi untuk pengujian.',
        body,
        'Kajian Hukum',
      ])
    ).id as string;
  let article: string;
  let first: string;
  let revision: string;
  await t.test('Signup cannot assign its own admin role', async () => {
    await as(A);
    assert.equal(
      (await one('select role from public.profiles where id=$1', [A])).role,
      'contributor',
    );
  });
  await t.test('Unverified users cannot create articles', async () => {
    await as(U);
    await assert.rejects(() => create(), /FORBIDDEN/);
  });
  await t.test('Verified contributor creates draft', async () => {
    await as(A);
    article = await create();
    first = (await version(article)).id;
    assert.equal((await version(article)).status, 'draft');
  });
  await t.test('Anonymous cannot see draft or private profile', async () => {
    await as(null, true);
    assert.equal((await db.query('select * from public.article_versions')).rows.length, 0);
    await assert.rejects(() => db.query('select * from public.profiles'), /permission denied/);
    await assert.rejects(() => create(), /permission denied/);
  });
  await t.test('Other contributor cannot read or edit draft even through direct RPC', async () => {
    await as(B);
    assert.equal((await db.query('select * from public.article_versions')).rows.length, 0);
    await assert.rejects(
      () =>
        db.query('select public.save_article($1,$2,0,$3,$4,$5,$6)', [
          article,
          first,
          'Judul disusupi',
          'Ringkasan yang disusupi oleh pengguna lain',
          body,
          'Opini',
        ]),
      /FORBIDDEN/,
    );
  });
  await t.test('Contributor cannot publish or write tables directly', async () => {
    await as(A);
    await assert.rejects(
      () => db.query("select public.transition_article($1,0,'publish','')", [first]),
      /FORBIDDEN/,
    );
    await assert.rejects(
      () => db.query("update public.article_versions set status='approved' where id=$1", [first]),
      /permission denied/,
    );
  });
  await t.test('Null optimistic version cannot bypass conflict checks', async () => {
    await as(A);
    await assert.rejects(
      () => db.query("select public.transition_article($1,null,'submit','')", [first]),
      /CONFLICT/,
    );
    await assert.rejects(
      () =>
        db.query('select public.save_article($1,$2,null,$3,$4,$5,$6)', [
          article,
          first,
          'Tidak boleh tertimpa',
          'Ringkasan yang cukup panjang untuk validasi',
          body,
          'Opini',
        ]),
      /CONFLICT/,
    );
  });
  await t.test('Submitting locks article against editing', async () => {
    await db.query("select public.transition_article($1,0,'submit','')", [first]);
    await assert.rejects(
      () =>
        db.query('select public.save_article($1,$2,1,$3,$4,$5,$6)', [
          article,
          first,
          'Judul diubah diam-diam',
          'Ringkasan yang telah diubah setelah pengajuan',
          body,
          'Opini',
        ]),
      /INVALID_STATE/,
    );
  });
  await t.test('Editor approves once; duplicate stale approval conflicts', async () => {
    await as(E);
    await db.query("select public.transition_article($1,1,'publish','Diperiksa')", [first]);
    await assert.rejects(
      () => db.query("select public.transition_article($1,1,'publish','')", [first]),
      /CONFLICT/,
    );
  });
  await t.test('Public sees only approved snapshot', async () => {
    await as(null, true);
    const rows = (await db.query('select id,title from public.article_versions')).rows;
    assert.equal(rows.length, 1);
    assert.equal((rows[0] as any).id, first);
  });
  await t.test(
    'Public view joins only the live version with no internal profile data',
    async () => {
      await as(null, true);
      const row = await one('select * from public.published_articles');
      assert.equal(row.id, first);
      assert.equal('phone' in row, false);
      assert.equal('institution' in row, false);
    },
  );
  await t.test('One revision only; old publication stays visible', async () => {
    await as(A);
    revision = (await one('select public.start_revision($1) as id', [article])).id;
    assert.equal((await one('select public.start_revision($1) as id', [article])).id, revision);
    await db.query('select public.save_article($1,$2,0,$3,$4,$5,$6)', [
      article,
      revision,
      'Judul revisi baru',
      'Ringkasan revisi yang mencukupi untuk pengujian.',
      body + ' Revisi.',
      'Opini',
    ]);
    await as(null, true);
    assert.equal(
      (await one('select title from public.article_versions')).title,
      'Judul awal kajian',
    );
  });
  await t.test('Stale save fails instead of overwriting another revision', async () => {
    await as(A);
    await assert.rejects(
      () =>
        db.query('select public.save_article($1,$2,0,$3,$4,$5,$6)', [
          article,
          revision,
          'Judul stale revision',
          'Ringkasan lama yang seharusnya tidak tersimpan',
          body,
          'Opini',
        ]),
      /CONFLICT/,
    );
  });
  await t.test('Rejected revision preserves live article and requires a note', async () => {
    await db.query("select public.transition_article($1,1,'submit','')", [revision]);
    await as(E);
    await assert.rejects(
      () => db.query("select public.transition_article($1,2,'reject','')", [revision]),
      /NOTE_REQUIRED/,
    );
    await db.query(
      "select public.transition_article($1,2,'reject','Sumber belum dapat diverifikasi')",
      [revision],
    );
    await as(null, true);
    assert.equal(
      (await one('select title from public.article_versions')).title,
      'Judul awal kajian',
    );
  });
  await t.test('Revised approval atomically replaces public version', async () => {
    await as(A);
    await db.query('select public.save_article($1,$2,3,$3,$4,$5,$6)', [
      article,
      revision,
      'Judul revisi disetujui',
      'Ringkasan revisi yang telah diperiksa ulang',
      body,
      'Opini',
    ]);
    await db.query("select public.transition_article($1,4,'submit','')", [revision]);
    await as(S);
    await db.query("select public.transition_article($1,5,'publish','Sumber sudah lengkap')", [
      revision,
    ]);
    await as(null, true);
    const rows = (await db.query('select * from public.article_versions')).rows as any[];
    assert.equal(rows.length, 1);
    assert.equal(rows[0].title, 'Judul revisi disetujui');
  });
  await t.test('Admin Database and Super Admin can publish own drafts', async () => {
    for (const id of [E, S]) {
      await as(id);
      const own = await create('Artikel mandiri admin');
      const v = await version(own);
      await db.query("select public.transition_article($1,0,'publish','')", [v.id]);
      assert.equal((await version(own)).status, 'approved');
    }
  });
  await t.test('Role escalation fails for contributors and Database Admin', async () => {
    for (const id of [A, E]) {
      await as(id);
      await assert.rejects(
        () => db.query("select public.update_access($1,'super_admin',true)", [id === A ? B : A]),
        /FORBIDDEN/,
      );
      await assert.rejects(
        () => db.query("update public.profiles set role='super_admin' where id=$1", [id]),
        /permission denied/,
      );
    }
  });
  await t.test('Deactivation blocks RPC but preserves publication and attribution', async () => {
    await as(S);
    await db.query("select public.update_access($1,'contributor',false)", [A]);
    await as(A);
    await assert.rejects(() => create(), /FORBIDDEN/);
    await as(null, true);
    assert.ok(
      (await db.query('select * from public.article_versions where id=$1', [revision])).rows
        .length === 1,
    );
  });
  await t.test('Withdrawal removes public access with audit reason retained', async () => {
    await as(E);
    const v = await one('select * from public.article_versions where id=$1', [revision]);
    await db.query("select public.transition_article($1,$2,'withdraw','Perlu pemeriksaan ulang')", [
      revision,
      v.lock_version,
    ]);
    await as(null, true);
    assert.equal(
      (await db.query('select * from public.article_versions where id=$1', [revision])).rows.length,
      0,
    );
    await as(E);
    assert.equal(
      (
        await one(
          "select note from public.editorial_decisions where version_id=$1 and action='withdraw'",
          [revision],
        )
      ).note,
      'Perlu pemeriksaan ulang',
    );
  });
  await t.test('Organization and content edits are restricted and version checked', async () => {
    await as(B);
    await assert.rejects(
      () => db.query("select public.save_organization(0,'Profil','','','','','')"),
      /FORBIDDEN/,
    );
    await as(E);
    await db.query("select public.save_organization(0,'Profil','','','','','')");
    await assert.rejects(
      () => db.query("select public.save_organization(0,'Tertimpa','','','','','')"),
      /CONFLICT/,
    );
  });
  await db.close();
});
