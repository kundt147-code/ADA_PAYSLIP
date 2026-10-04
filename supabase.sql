create extension if not exists pgcrypto;
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bank text default '',
  account text default '',
  salary jsonb not null default '{"teacher":{"class":0,"assist":0,"tutoring":0},"office":{"full":0,"part":0},"insuranceBase":0,"transfer":0}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- For an internal tool, you can enable public CRUD with these policies.
-- For production with bank-account data, replace these with authenticated-user policies.
alter table public.employees enable row level security;
do $$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='employees' and policyname='employees_select') then create policy "employees_select" on public.employees for select using (true); end if; end $$;
do $$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='employees' and policyname='employees_insert') then create policy "employees_insert" on public.employees for insert with check (true); end if; end $$;
do $$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='employees' and policyname='employees_update') then create policy "employees_update" on public.employees for update using (true) with check (true); end if; end $$;
do $$ begin if not exists (select 1 from pg_policies where schemaname='public' and tablename='employees' and policyname='employees_delete') then create policy "employees_delete" on public.employees for delete using (true); end if; end $$;

-- Additive V35 migration: keeps existing rows and salary JSON intact.
alter table public.employees add column if not exists branch text default '';
alter table public.employees add column if not exists position text default '';
alter table public.employees add column if not exists "noAttendance" boolean default false;
-- Shared employee files. Private bucket; sign-in required, team accounts provisioned by admin.
insert into storage.buckets (id,name,public) values ('employee-documents','employee-documents',false) on conflict (id) do nothing;
create table if not exists public.employee_document_members (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.employee_document_members enable row level security;
grant select on public.employee_document_members to authenticated;
drop policy if exists employee_document_members_self on public.employee_document_members;
create policy employee_document_members_self on public.employee_document_members for select to authenticated using (user_id=auth.uid());
drop policy if exists employee_documents_read on storage.objects;
create policy employee_documents_read on storage.objects for select to authenticated using (bucket_id='employee-documents' and exists (select 1 from public.employee_document_members where user_id=auth.uid()));
drop policy if exists employee_documents_upload on storage.objects;
create policy employee_documents_upload on storage.objects for insert to authenticated with check (bucket_id='employee-documents' and exists (select 1 from public.employee_document_members where user_id=auth.uid()));
-- No anonymous file access or public URLs. Files removed from a profile are unlinked, not purged.
