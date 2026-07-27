create schema if not exists private;

create unique index if not exists profiles_display_name_lower_idx
  on public.profiles (lower(display_name));

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_display_name text;
begin
  requested_display_name := nullif(trim(new.raw_user_meta_data ->> 'display_name'), '');

  if requested_display_name is null
    or char_length(requested_display_name) < 2
    or char_length(requested_display_name) > 30 then
    raise exception 'Invalid display name';
  end if;

  insert into public.users (id, email, email_verified)
  values (new.id, coalesce(new.email, ''), new.email_confirmed_at is not null);

  insert into public.profiles (user_id, display_name)
  values (new.id, requested_display_name);

  return new;
end;
$$;

revoke all on function private.handle_new_auth_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_auth_user();

create or replace function private.handle_auth_user_updated()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.users
  set
    email = coalesce(new.email, email),
    email_verified = new.email_confirmed_at is not null,
    updated_at = now()
  where id = new.id;
  return new;
end;
$$;

revoke all on function private.handle_auth_user_updated() from public, anon, authenticated;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email, email_confirmed_at on auth.users
  for each row execute function private.handle_auth_user_updated();

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant usage, select on sequences to authenticated;

do $$
declare
  table_record record;
begin
  for table_record in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('alter table public.%I enable row level security', table_record.tablename);
  end loop;
end
$$;

create policy "users_select_own"
  on public.users for select to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "characters_select_own"
  on public.characters for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "characters_insert_own"
  on public.characters for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "characters_update_own"
  on public.characters for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "characters_delete_own"
  on public.characters for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "character_stats_own"
  on public.character_stats for all to authenticated
  using (exists (
    select 1 from public.characters
    where characters.id = character_stats.character_id
      and characters.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.characters
    where characters.id = character_stats.character_id
      and characters.user_id = (select auth.uid())
  ));

create policy "character_resources_own"
  on public.character_resources for all to authenticated
  using (exists (
    select 1 from public.characters
    where characters.id = character_resources.character_id
      and characters.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.characters
    where characters.id = character_resources.character_id
      and characters.user_id = (select auth.uid())
  ));

create policy "equipment_slots_own"
  on public.equipment_slots for all to authenticated
  using (exists (
    select 1 from public.characters
    where characters.id = equipment_slots.character_id
      and characters.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.characters
    where characters.id = equipment_slots.character_id
      and characters.user_id = (select auth.uid())
  ));

create policy "character_items_own"
  on public.character_items for all to authenticated
  using (exists (
    select 1 from public.characters
    where characters.id = character_items.character_id
      and characters.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.characters
    where characters.id = character_items.character_id
      and characters.user_id = (select auth.uid())
  ));

create policy "currency_ledger_own"
  on public.currency_ledger for select to authenticated
  using (exists (
    select 1 from public.characters
    where characters.id = currency_ledger.character_id
      and characters.user_id = (select auth.uid())
  ));
create policy "currency_ledger_insert_own"
  on public.currency_ledger for insert to authenticated
  with check (exists (
    select 1 from public.characters
    where characters.id = currency_ledger.character_id
      and characters.user_id = (select auth.uid())
  ));

create policy "notifications_own"
  on public.notifications for all to authenticated
  using (exists (
    select 1 from public.characters
    where characters.id = notifications.character_id
      and characters.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.characters
    where characters.id = notifications.character_id
      and characters.user_id = (select auth.uid())
  ));

do $$
declare
  lookup_table text;
begin
  foreach lookup_table in array array[
    'factions',
    'item_templates',
    'material_templates',
    'crafting_recipe_templates',
    'enemies',
    'regions',
    'world_regions',
    'territory_nodes',
    'story_campaigns',
    'story_chapters',
    'story_missions',
    'story_decisions',
    'seasons',
    'season_pass_tiers',
    'season_rewards',
    'cosmetic_items',
    'daily_rewards',
    'live_events',
    'live_ops_events',
    'patch_notes',
    'economy_config',
    'content_versions'
  ]
  loop
    execute format(
      'create policy %I on public.%I for select to authenticated using (true)',
      lookup_table || '_authenticated_read',
      lookup_table
    );
  end loop;
end
$$;
