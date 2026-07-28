-- Staff screens need cross-player reads after the action has verified the role.
do $$
declare
  table_record record;
begin
  for table_record in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format(
      'create policy %I on public.%I for select to authenticated using (private.is_staff())',
      table_record.tablename || '_staff_read',
      table_record.tablename
    );
  end loop;
end
$$;

create policy "users_staff_update"
  on public.users for update to authenticated
  using (private.is_staff())
  with check (private.is_staff());

create policy "characters_staff_update"
  on public.characters for update to authenticated
  using (private.is_staff())
  with check (private.is_staff());

create policy "currency_ledger_staff_insert"
  on public.currency_ledger for insert to authenticated
  with check (private.is_staff());

create policy "clan_members_staff_delete"
  on public.clan_members for delete to authenticated
  using (private.is_staff());
