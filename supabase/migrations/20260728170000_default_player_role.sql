alter table public.users
  alter column role set default 'player';

create or replace function private.handle_auth_user_deleted()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.users where id = old.id;
  return old;
end;
$$;

revoke all on function private.handle_auth_user_deleted() from public, anon, authenticated;

drop trigger if exists on_auth_user_deleted on auth.users;
create trigger on_auth_user_deleted
  after delete on auth.users
  for each row execute function private.handle_auth_user_deleted();
