-- Supabase SQL Editor: execute this schema, then seed.sql, then grant the intended Auth user.
create table if not exists public.teacher_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create table if not exists public.teacher_content (
  id integer primary key check (id = 1),
  content jsonb not null,
  revision bigint not null default 0,
  updated_at timestamptz not null default now()
);
create table if not exists public.teacher_documents (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(title) between 1 and 200),
  name text not null check (length(name) between 1 and 255),
  category text not null,
  storage_path text unique not null,
  type text not null,
  created_at timestamptz not null default now()
);
alter table public.teacher_admins enable row level security;
alter table public.teacher_content enable row level security;
alter table public.teacher_documents enable row level security;
revoke all on public.teacher_admins, public.teacher_content, public.teacher_documents from anon, authenticated;
grant select on public.teacher_content to anon, authenticated;
grant select on public.teacher_admins, public.teacher_documents to authenticated;
drop policy if exists teacher_admin_self on public.teacher_admins;
create policy teacher_admin_self on public.teacher_admins for select to authenticated using (user_id = auth.uid());
drop policy if exists teacher_public_content on public.teacher_content;
create policy teacher_public_content on public.teacher_content for select to anon, authenticated using (id = 1);
create or replace function public.is_teacher_admin() returns boolean
language sql stable security definer set search_path = public
as $$ select auth.uid() is not null and exists (select 1 from public.teacher_admins where user_id = auth.uid()); $$;
revoke all on function public.is_teacher_admin() from public;
grant execute on function public.is_teacher_admin() to anon, authenticated;
drop policy if exists teacher_private_documents on public.teacher_documents;
create policy teacher_private_documents on public.teacher_documents for select to authenticated
using (owner_id = auth.uid() and public.is_teacher_admin());

create or replace function public.teacher_validate_content(p_document jsonb) returns void
language plpgsql set search_path = public as $$
declare section text; row jsonb; date_text text;
begin
 if jsonb_typeof(p_document) is distinct from 'object' or coalesce(p_document->>'version','') <> '1'
    or octet_length(p_document::text) > 2097152 then raise exception 'Invalid content' using errcode = '23514'; end if;
 foreach section in array array['tasks','schedule','plans','events','notes','links'] loop
  if jsonb_typeof(p_document->section) is distinct from 'array' or jsonb_array_length(p_document->section) > 5000
   then raise exception 'Invalid list' using errcode = '23514'; end if;
  if exists(select 1 from jsonb_array_elements(p_document->section) e group by e->>'id' having count(*) > 1)
   then raise exception 'Duplicate ID' using errcode = '23514'; end if;
  for row in select value from jsonb_array_elements(p_document->section) loop
   if jsonb_typeof(row) is distinct from 'object' or length(coalesce(row->>'id','')) not between 1 and 200
      or length(btrim(coalesce(row->>'title',''))) not between 1 and 200 or length(coalesce(row->>'body','')) > 10000
    then raise exception 'Invalid record' using errcode = '23514'; end if;
   if section in ('tasks','plans','events') then
    date_text := coalesce(row->>'date','');
    if section = 'events' and date_text = '' then raise exception 'Date required' using errcode = '23514'; end if;
    if date_text <> '' then
     begin
      if date_text !~ '^\d{4}-\d{2}-\d{2}$' or to_char(date_text::date,'YYYY-MM-DD') <> date_text
       then raise exception 'Invalid date' using errcode = '23514'; end if;
     exception when datetime_field_overflow or invalid_datetime_format then raise exception 'Invalid date' using errcode = '23514'; end;
    end if;
   end if;
   if section = 'schedule' and (coalesce(row->>'day','') !~ '^[0-4]$' or coalesce(row->>'period','') !~ '^[0-7]$'
     or coalesce(row->>'time','') !~ '^([01][0-9]|2[0-3]):[0-5][0-9]$') then raise exception 'Invalid schedule' using errcode = '23514'; end if;
   if section = 'links' and coalesce(row->>'url','') !~ '^https?://[^[:space:]]+$' then raise exception 'Invalid link' using errcode = '23514'; end if;
  end loop;
 end loop;
 if exists(select 1 from jsonb_array_elements(p_document->'schedule') e group by e->>'day',e->>'period' having count(*) > 1)
  then raise exception 'Duplicate schedule slot' using errcode = '23514'; end if;
end $$;
revoke all on function public.teacher_validate_content(jsonb) from public, anon, authenticated;

create or replace function public.teacher_save_content(p_document jsonb, p_revision bigint) returns jsonb
language plpgsql security definer set search_path = public as $$
declare new_revision bigint;
begin
 if not public.is_teacher_admin() then raise exception 'Admin required' using errcode = '42501'; end if;
 perform public.teacher_validate_content(p_document);
 update public.teacher_content set content = p_document, revision = revision + 1, updated_at = now()
 where id = 1 and revision = p_revision returning revision into new_revision;
 if not found then raise exception 'Revision conflict' using errcode = '40001'; end if;
 return jsonb_build_object('content',p_document,'revision',new_revision);
end $$;
revoke all on function public.teacher_save_content(jsonb,bigint) from public, anon;
grant execute on function public.teacher_save_content(jsonb,bigint) to authenticated;

create or replace function public.teacher_validate_file(p_file jsonb) returns void
language plpgsql set search_path = public as $$
begin
 if jsonb_typeof(p_file) is distinct from 'object' or coalesce(p_file->>'id','') !~ '^[0-9a-fA-F-]{36}$'
    or length(btrim(coalesce(p_file->>'title',''))) not between 1 and 200
    or length(coalesce(p_file->>'name','')) not between 1 and 255
    or length(coalesce(p_file->>'category','')) not between 1 and 200
    or length(coalesce(p_file->>'type','')) not between 1 and 255
    or coalesce(p_file->>'storage_path','') <> auth.uid()::text || '/' || (p_file->>'id')
    or not exists (select 1 from storage.objects where bucket_id = 'teacher-private-files' and name = p_file->>'storage_path')
 then raise exception 'Invalid private file' using errcode = '23514'; end if;
 perform (p_file->>'id')::uuid;
end $$;
revoke all on function public.teacher_validate_file(jsonb) from public, anon, authenticated;

create or replace function public.teacher_put_document(p_file jsonb, p_previous_id uuid default null) returns void
language plpgsql security definer set search_path = public as $$
begin
 if not public.is_teacher_admin() then raise exception 'Admin required' using errcode = '42501'; end if;
 perform public.teacher_validate_file(p_file);
 if p_previous_id is not null then
  delete from public.teacher_documents where id = p_previous_id and owner_id = auth.uid();
  if not found then raise exception 'Owner required' using errcode = '42501'; end if;
 end if;
 insert into public.teacher_documents(id,owner_id,title,name,category,storage_path,type)
 values((p_file->>'id')::uuid,auth.uid(),p_file->>'title',p_file->>'name',p_file->>'category',p_file->>'storage_path',p_file->>'type');
end $$;
revoke all on function public.teacher_put_document(jsonb,uuid) from public, anon;
grant execute on function public.teacher_put_document(jsonb,uuid) to authenticated;

create or replace function public.teacher_delete_document(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
 if not public.is_teacher_admin() then raise exception 'Admin required' using errcode = '42501'; end if;
 delete from public.teacher_documents where id = p_id and owner_id = auth.uid();
 if not found then raise exception 'Owner required' using errcode = '42501'; end if;
end $$;
revoke all on function public.teacher_delete_document(uuid) from public, anon;
grant execute on function public.teacher_delete_document(uuid) to authenticated;

create or replace function public.teacher_restore_content(p_document jsonb,p_revision bigint,p_files jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare row jsonb; result jsonb;
begin
 if not public.is_teacher_admin() then raise exception 'Admin required' using errcode = '42501'; end if;
 if jsonb_typeof(p_files) is distinct from 'array' or jsonb_array_length(p_files) > 1000 then raise exception 'Invalid files' using errcode = '23514'; end if;
 for row in select value from jsonb_array_elements(p_files) loop perform public.teacher_validate_file(row); end loop;
 result := public.teacher_save_content(p_document,p_revision);
 delete from public.teacher_documents where owner_id = auth.uid();
 for row in select value from jsonb_array_elements(p_files) loop
  insert into public.teacher_documents(id,owner_id,title,name,category,storage_path,type)
  values((row->>'id')::uuid,auth.uid(),row->>'title',row->>'name',row->>'category',row->>'storage_path',row->>'type');
 end loop;
 return result;
end $$;
revoke all on function public.teacher_restore_content(jsonb,bigint,jsonb) from public, anon;
grant execute on function public.teacher_restore_content(jsonb,bigint,jsonb) to authenticated;

create or replace function public.teacher_analysis() returns jsonb
language plpgsql security definer set search_path = public as $$
declare data jsonb; day date := (current_timestamp at time zone 'Europe/Istanbul')::date;
begin
 if not public.is_teacher_admin() then raise exception 'Admin required' using errcode = '42501'; end if;
 select content into data from public.teacher_content where id = 1;
 return jsonb_build_object(
  'pending',(select count(*) from jsonb_array_elements(data->'tasks') e where e->>'done' <> 'true'),
  'completed',(select count(*) from jsonb_array_elements(data->'tasks') e where e->>'done' = 'true'),
  'plans',jsonb_array_length(data->'plans'),
  'documents',(select count(*) from public.teacher_documents where owner_id = auth.uid()),
  'events',(select count(*) from jsonb_array_elements(data->'events') e where (e->>'date')::date >= day));
end $$;
revoke all on function public.teacher_analysis() from public, anon;
grant execute on function public.teacher_analysis() to authenticated;

insert into storage.buckets(id,name,public,file_size_limit)
values('teacher-private-files','teacher-private-files',false,20971520)
on conflict(id) do update set public = false, file_size_limit = 20971520;
drop policy if exists teacher_files_read on storage.objects;
drop policy if exists teacher_files_create on storage.objects;
drop policy if exists teacher_files_delete on storage.objects;
create policy teacher_files_read on storage.objects for select to authenticated
using (bucket_id = 'teacher-private-files' and (storage.foldername(name))[1] = auth.uid()::text and public.is_teacher_admin());
create policy teacher_files_create on storage.objects for insert to authenticated
with check (bucket_id = 'teacher-private-files' and (storage.foldername(name))[1] = auth.uid()::text and public.is_teacher_admin());
create policy teacher_files_delete on storage.objects for delete to authenticated
using (bucket_id = 'teacher-private-files' and (storage.foldername(name))[1] = auth.uid()::text and public.is_teacher_admin());
-- There is intentionally no public signup UI or public mutation policy.
