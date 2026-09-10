-- Sahabat Nusa. Run on a NEW Supabase project; never overwrite existing tables.
begin;
create table public.profiles (
 id uuid primary key references auth.users(id), name text not null check(length(name) between 2 and 100),
 phone text not null check(phone ~ '^\+?[0-9 ()-]{8,25}$'), institution text not null check(length(institution) between 2 and 160),
 education text not null default '' check(length(education)<=200), social_links jsonb not null default '{}' check(jsonb_typeof(social_links)='object' and octet_length(social_links::text)<=4000),
 role text not null default 'contributor' check(role in ('contributor','database_admin','super_admin')),
 active boolean not null default true, created_at timestamptz not null default now()
);
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,name,phone,institution,education,social_links)
 values(new.id,trim(new.raw_user_meta_data->>'name'),trim(new.raw_user_meta_data->>'phone'),trim(new.raw_user_meta_data->>'institution'),coalesce(new.raw_user_meta_data->>'education',''),coalesce(new.raw_user_meta_data->'social_links','{}'));
 return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
create function public.active_user() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p join auth.users u on u.id=p.id where p.id=auth.uid() and p.active and u.email_confirmed_at is not null)
$$;
create function public.is_editor() returns boolean language sql stable security definer set search_path='' as $$
 select public.active_user() and exists(select 1 from public.profiles where id=auth.uid() and role in ('database_admin','super_admin'))
$$;
create function public.is_super() returns boolean language sql stable security definer set search_path='' as $$
 select public.active_user() and exists(select 1 from public.profiles where id=auth.uid() and role='super_admin')
$$;
create table public.articles (
 id uuid primary key default gen_random_uuid(), author_id uuid not null references public.profiles(id),
 slug text not null unique, published_version_id uuid, withdrawn boolean not null default false, created_at timestamptz not null default now()
);
create table public.article_versions (
 id uuid primary key default gen_random_uuid(), article_id uuid not null references public.articles(id),
 title text not null check(length(title) between 5 and 180), summary text not null check(length(summary) between 20 and 400), body text not null check(length(body) between 50 and 60000),
 category text not null check(category in ('Opini','Kajian Hukum','Policy Brief')),
 status text not null default 'draft' check(status in ('draft','submitted','changes_requested','rejected','approved')),
 author_name text not null, lock_version integer not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), published_at timestamptz,
 unique(article_id,id)
);
alter table public.articles add constraint published_version_belongs_to_article foreign key(id,published_version_id) references public.article_versions(article_id,id) deferrable initially deferred;
create unique index one_open_version on public.article_versions(article_id) where status <> 'approved';
create index versions_article on public.article_versions(article_id,created_at desc);
create index articles_author on public.articles(author_id);
create table public.editorial_decisions (
 id uuid primary key default gen_random_uuid(), version_id uuid not null references public.article_versions(id), actor_id uuid not null references public.profiles(id),
 action text not null, note text not null default '', created_at timestamptz not null default now()
);
create index decisions_version on public.editorial_decisions(version_id);
create table public.organization (
 id integer primary key check(id=1),profile text not null default '',vision text not null default '',mission text not null default '',email text not null default '',phone text not null default '',logo_url text not null default '',lock_version integer not null default 0
);
insert into public.organization(id) values(1);
create table public.content_items (
 id uuid primary key default gen_random_uuid(),kind text not null check(kind in ('program','activity','officer')),
 title text not null check(length(title) between 2 and 180),description text not null check(length(description) between 2 and 12000),
 image_url text not null default '',contact text not null default '',event_date date,visible boolean not null default false,
 sort_order integer not null default 0 check(sort_order between 0 and 9999),lock_version integer not null default 0
);
create table public.access_audit(id uuid primary key default gen_random_uuid(),actor_id uuid not null references public.profiles(id),target_id uuid not null references public.profiles(id),previous_role text not null,new_role text not null,active boolean not null,created_at timestamptz not null default now());
-- Definer helpers avoid recursive RLS between articles and versions.
create function public.can_read_article(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.articles where id=p_id and ((published_version_id is not null and not withdrawn) or (public.active_user() and author_id=auth.uid()) or public.is_editor()))
$$;
create function public.can_read_version(p_id uuid,p_article uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.articles where id=p_article and ((published_version_id=p_id and not withdrawn) or (public.active_user() and author_id=auth.uid()) or public.is_editor()))
$$;
create function public.can_read_decision(p_version uuid) returns boolean language sql stable security definer set search_path='' as $$
 select public.is_editor() or (public.active_user() and exists(select 1 from public.article_versions v join public.articles a on a.id=v.article_id where v.id=p_version and a.author_id=auth.uid()))
$$;
alter table public.profiles enable row level security;
alter table public.articles enable row level security;
alter table public.article_versions enable row level security;
alter table public.editorial_decisions enable row level security;
alter table public.organization enable row level security;
alter table public.content_items enable row level security;
alter table public.access_audit enable row level security;
create policy profiles_read on public.profiles for select to authenticated using((id=auth.uid() and public.active_user()) or public.is_editor());
create policy articles_read on public.articles for select to anon,authenticated using(public.can_read_article(id));
create policy versions_read on public.article_versions for select to anon,authenticated using(public.can_read_version(id,article_id));
create policy decisions_read on public.editorial_decisions for select to authenticated using(public.can_read_decision(version_id));
create policy organization_read on public.organization for select to anon,authenticated using(true);
create policy content_read on public.content_items for select to anon,authenticated using(visible or public.is_editor());
create policy audit_read on public.access_audit for select to authenticated using(public.is_super());
-- One SQL snapshot prevents a publication pointer changing between two public reads.
create view public.published_articles with (security_invoker=true) as
 select v.*,a.slug from public.article_versions v
 join public.articles a on a.published_version_id=v.id and a.id=v.article_id
 where not a.withdrawn and v.status='approved';
grant select on public.published_articles to anon,authenticated;
-- All mutations pass through guarded transactional functions. No table write grants.
revoke all on public.profiles,public.articles,public.article_versions,public.editorial_decisions,public.organization,public.content_items,public.access_audit from anon,authenticated;
grant select on public.articles,public.article_versions,public.organization,public.content_items to anon,authenticated;
grant select on public.profiles,public.editorial_decisions,public.access_audit to authenticated;

create function public.save_article(p_article uuid,p_version uuid,p_expected integer,p_title text,p_summary text,p_body text,p_category text) returns uuid language plpgsql security definer set search_path='' as $$
declare a public.articles; v public.article_versions; aid uuid; n text;
begin
 if not public.active_user() then raise exception 'FORBIDDEN'; end if;
 select name into n from public.profiles where id=auth.uid();
 if p_article is null then
  aid:=gen_random_uuid();
  insert into public.articles(id,author_id,slug) values(aid,auth.uid(),coalesce(nullif(trim(both '-' from regexp_replace(lower(p_title),'[^a-z0-9]+','-','g')),''),'artikel')||'-'||aid::text);
  insert into public.article_versions(article_id,title,summary,body,category,author_name) values(aid,trim(p_title),trim(p_summary),trim(p_body),p_category,n);
  return aid;
 end if;
 select * into a from public.articles where id=p_article for update;
 if not found or a.author_id<>auth.uid() then raise exception 'FORBIDDEN'; end if;
 select * into v from public.article_versions where id=p_version and article_id=a.id for update;
 if not found or p_expected is null or v.lock_version<>p_expected then raise exception 'CONFLICT'; end if;
 if v.status not in ('draft','changes_requested','rejected') then raise exception 'INVALID_STATE'; end if;
 update public.article_versions set title=trim(p_title),summary=trim(p_summary),body=trim(p_body),category=p_category,status='draft',lock_version=lock_version+1,updated_at=now() where id=v.id;
 return a.id;
end $$;
create function public.start_revision(p_article uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare a public.articles; v public.article_versions; existing uuid; result uuid;
begin
 if not public.active_user() then raise exception 'FORBIDDEN'; end if;
 select * into a from public.articles where id=p_article for update;
 if not found or a.author_id<>auth.uid() then raise exception 'FORBIDDEN'; end if;
 select id into existing from public.article_versions where article_id=a.id and status<>'approved';
 if existing is not null then return existing; end if;
 select * into v from public.article_versions where id=a.published_version_id;
 if not found then raise exception 'INVALID_STATE'; end if;
 insert into public.article_versions(article_id,title,summary,body,category,author_name) values(a.id,v.title,v.summary,v.body,v.category,v.author_name) returning id into result;
 return result;
end $$;
create function public.transition_article(p_version uuid,p_expected integer,p_action text,p_note text default '') returns void language plpgsql security definer set search_path='' as $$
declare a public.articles; v public.article_versions; aid uuid;
begin
 if not public.active_user() then raise exception 'FORBIDDEN'; end if;
 select article_id into aid from public.article_versions where id=p_version;
 -- Always lock article before version, same order as save/revise.
 select * into a from public.articles where id=aid for update;
 select * into v from public.article_versions where id=p_version for update;
 if not found or p_expected is null or v.lock_version<>p_expected then raise exception 'CONFLICT'; end if;
 if length(coalesce(p_note,''))>2000 then raise exception 'INVALID_NOTE'; end if;
 if p_action='submit' then
  if a.author_id<>auth.uid() or v.status<>'draft' then raise exception 'FORBIDDEN'; end if;
  update public.article_versions set status='submitted' where id=v.id;
 elsif p_action='cancel' then
  if a.author_id<>auth.uid() or v.status<>'submitted' then raise exception 'FORBIDDEN'; end if;
  update public.article_versions set status='draft' where id=v.id;
 elsif p_action='publish' then
  if not public.is_editor() or not (v.status='submitted' or (a.author_id=auth.uid() and v.status='draft')) then raise exception 'FORBIDDEN'; end if;
  update public.article_versions set status='approved',published_at=now() where id=v.id;
  update public.articles set published_version_id=v.id,withdrawn=false where id=a.id;
 elsif p_action in ('request_changes','reject') then
  if not public.is_editor() or v.status<>'submitted' then raise exception 'FORBIDDEN'; end if;
  if length(trim(coalesce(p_note,'')))<3 then raise exception 'NOTE_REQUIRED'; end if;
  update public.article_versions set status=case when p_action='reject' then 'rejected' else 'changes_requested' end where id=v.id;
 elsif p_action='withdraw' then
  if not public.is_editor() or a.published_version_id<>v.id or a.withdrawn or length(trim(coalesce(p_note,'')))<3 then raise exception 'FORBIDDEN'; end if;
  update public.articles set withdrawn=true where id=a.id;
 else raise exception 'INVALID_ACTION'; end if;
 update public.article_versions set lock_version=lock_version+1,updated_at=now() where id=v.id;
 insert into public.editorial_decisions(version_id,actor_id,action,note) values(v.id,auth.uid(),p_action,coalesce(p_note,''));
end $$;
create function public.update_profile(p_name text,p_phone text,p_institution text,p_education text,p_social_links jsonb) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.active_user() then raise exception 'FORBIDDEN'; end if;
 if octet_length(p_social_links::text)>4000 then raise exception 'INVALID_PROFILE'; end if;
 update public.profiles set name=trim(p_name),phone=trim(p_phone),institution=trim(p_institution),education=trim(p_education),social_links=p_social_links where id=auth.uid();
end $$;
create function public.update_access(p_target uuid,p_role text,p_active boolean) returns void language plpgsql security definer set search_path='' as $$
declare old_role text;
begin
 perform pg_catalog.pg_advisory_xact_lock(901001);
 if not public.is_super() or p_target=auth.uid() then raise exception 'FORBIDDEN'; end if;
 select role into old_role from public.profiles where id=p_target for update;
 if not found then raise exception 'NOT_FOUND'; end if;
 update public.profiles set role=p_role,active=p_active where id=p_target;
 insert into public.access_audit(actor_id,target_id,previous_role,new_role,active) values(auth.uid(),p_target,old_role,p_role,p_active);
end $$;
create function public.save_organization(p_expected integer,p_profile text,p_vision text,p_mission text,p_email text,p_phone text,p_logo_url text) returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_editor() then raise exception 'FORBIDDEN'; end if;
 if length(p_profile)>12000 or length(p_vision)>3000 or length(p_mission)>5000 or length(p_logo_url)>1000 then raise exception 'INVALID_CONTENT'; end if;
 update public.organization set profile=p_profile,vision=p_vision,mission=p_mission,email=p_email,phone=p_phone,logo_url=p_logo_url,lock_version=lock_version+1 where id=1 and lock_version=p_expected;
 if not found then raise exception 'CONFLICT'; end if;
end $$;
create function public.save_content(p_id uuid,p_expected integer,p_kind text,p_title text,p_description text,p_image_url text,p_contact text,p_event_date date,p_visible boolean,p_sort_order integer) returns uuid language plpgsql security definer set search_path='' as $$
declare result uuid;
begin
 if not public.is_editor() then raise exception 'FORBIDDEN'; end if;
 if length(p_image_url)>1000 or length(p_contact)>30 then raise exception 'INVALID_CONTENT'; end if;
 if p_id is null then
  insert into public.content_items(kind,title,description,image_url,contact,event_date,visible,sort_order) values(p_kind,p_title,p_description,p_image_url,p_contact,p_event_date,p_visible,p_sort_order) returning id into result;
 else
  update public.content_items set kind=p_kind,title=p_title,description=p_description,image_url=p_image_url,contact=p_contact,event_date=p_event_date,visible=p_visible,sort_order=p_sort_order,lock_version=lock_version+1 where id=p_id and lock_version=p_expected returning id into result;
  if not found then raise exception 'CONFLICT'; end if;
 end if;
 return result;
end $$;
-- Definer functions are not callable by PUBLIC unless explicitly granted.
revoke execute on function public.handle_new_user(),public.active_user(),public.is_editor(),public.is_super(),public.can_read_article(uuid),public.can_read_version(uuid,uuid),public.can_read_decision(uuid),public.save_article(uuid,uuid,integer,text,text,text,text),public.start_revision(uuid),public.transition_article(uuid,integer,text,text),public.update_profile(text,text,text,text,jsonb),public.update_access(uuid,text,boolean),public.save_organization(integer,text,text,text,text,text,text),public.save_content(uuid,integer,text,text,text,text,text,date,boolean,integer) from public,anon,authenticated;
grant execute on function public.active_user(),public.is_editor(),public.is_super(),public.can_read_article(uuid),public.can_read_version(uuid,uuid),public.can_read_decision(uuid) to anon,authenticated;
grant execute on function public.save_article(uuid,uuid,integer,text,text,text,text),public.start_revision(uuid),public.transition_article(uuid,integer,text,text),public.update_profile(text,text,text,text,jsonb),public.update_access(uuid,text,boolean),public.save_organization(integer,text,text,text,text,text,text),public.save_content(uuid,integer,text,text,text,text,text,date,boolean,integer) to authenticated;
-- Public media contains only assets deliberately uploaded by an editor for publication.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('media','media',true,5242880,array['image/jpeg','image/png','image/webp']);
create policy media_admin_insert on storage.objects for insert to authenticated with check(bucket_id='media' and public.is_editor() and (storage.foldername(name))[1]=auth.uid()::text);
create policy media_read on storage.objects for select to anon,authenticated using(bucket_id='media');
commit;
