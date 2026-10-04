-- Run after supabase.sql. Use the same approved team accounts as shared documents.
create table if not exists public.payroll_attendance (id text primary key, data jsonb not null);
create table if not exists public.payroll_payslips (id text primary key, data jsonb not null);
alter table public.payroll_attendance enable row level security;
alter table public.payroll_payslips enable row level security;
grant select,insert,update,delete on public.payroll_attendance,public.payroll_payslips to authenticated;
drop policy if exists payroll_team on public.payroll_attendance;
create policy payroll_team on public.payroll_attendance for all to authenticated using (exists(select 1 from public.employee_document_members where user_id=auth.uid())) with check (exists(select 1 from public.employee_document_members where user_id=auth.uid()));
drop policy if exists payroll_team on public.payroll_payslips;
create policy payroll_team on public.payroll_payslips for all to authenticated using (exists(select 1 from public.employee_document_members where user_id=auth.uid())) with check (exists(select 1 from public.employee_document_members where user_id=auth.uid()));
-- Replace old anonymous employee policies; approved team only.
drop policy if exists employees_select on public.employees;
drop policy if exists employees_insert on public.employees;
drop policy if exists employees_update on public.employees;
drop policy if exists employees_delete on public.employees;
grant select,insert,update,delete on public.employees to authenticated;
drop policy if exists payroll_employee_team on public.employees;
create policy payroll_employee_team on public.employees for all to authenticated using (exists(select 1 from public.employee_document_members where user_id=auth.uid())) with check (exists(select 1 from public.employee_document_members where user_id=auth.uid()));
