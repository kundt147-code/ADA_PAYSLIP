-- Authorized link access: no login; anyone can read/write payroll and retrieve/upload files.
grant select,insert,update,delete on public.employees,public.payroll_attendance,public.payroll_payslips to anon,authenticated;
drop policy if exists payroll_link_access on public.employees;
create policy payroll_link_access on public.employees for all to anon,authenticated using (true) with check (true);
drop policy if exists payroll_link_access on public.payroll_attendance;
create policy payroll_link_access on public.payroll_attendance for all to anon,authenticated using (true) with check (true);
drop policy if exists payroll_link_access on public.payroll_payslips;
create policy payroll_link_access on public.payroll_payslips for all to anon,authenticated using (true) with check (true);
drop policy if exists employee_documents_link_read on storage.objects;
create policy employee_documents_link_read on storage.objects for select to anon,authenticated using (bucket_id='employee-documents');
drop policy if exists employee_documents_link_upload on storage.objects;
create policy employee_documents_link_upload on storage.objects for insert to anon,authenticated with check (bucket_id='employee-documents');
-- Files stay private-bucket objects fetched through the app. Removing a profile attachment unlinks it, as before.
