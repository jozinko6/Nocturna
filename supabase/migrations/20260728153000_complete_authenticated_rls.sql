create or replace function private.owns_character(target_character_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.characters
    where id = target_character_id
      and user_id = (select auth.uid())
  );
$$;

create or replace function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.users
    where id = (select auth.uid())
      and role in ('support', 'moderator', 'economy_manager', 'administrator')
  );
$$;

create or replace function private.participates_in_conversation(target_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversation_participants
    where conversation_id = target_conversation_id
      and private.owns_character(character_id)
  );
$$;

revoke all on function private.owns_character(uuid) from public, anon;
revoke all on function private.is_staff() from public, anon;
revoke all on function private.participates_in_conversation(uuid) from public, anon;
grant execute on function private.owns_character(uuid) to authenticated;
grant execute on function private.is_staff() to authenticated;
grant execute on function private.participates_in_conversation(uuid) to authenticated;

-- Rows attached directly to a character or user are private to their owner.
do $$
declare
  table_record record;
begin
  for table_record in
    select c.table_name
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.column_name = 'character_id'
      and c.table_name not in ('daily_rewards', 'season_rewards')
  loop
    execute format(
      'create policy %I on public.%I for all to authenticated using (private.owns_character(character_id)) with check (private.owns_character(character_id))',
      table_record.table_name || '_character_owner',
      table_record.table_name
    );
  end loop;

  for table_record in
    select c.table_name
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.column_name = 'user_id'
      and c.table_name not in ('profiles', 'characters')
  loop
    execute format(
      'create policy %I on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      table_record.table_name || '_user_owner',
      table_record.table_name
    );
  end loop;
end
$$;

-- These two tables were accidentally exposed as global lookup data.
drop policy if exists "daily_rewards_authenticated_read" on public.daily_rewards;
drop policy if exists "season_rewards_authenticated_read" on public.season_rewards;

create policy "daily_rewards_character_owner"
  on public.daily_rewards for all to authenticated
  using (private.owns_character(character_id))
  with check (private.owns_character(character_id));

create policy "season_rewards_character_owner"
  on public.season_rewards for all to authenticated
  using (private.owns_character(character_id))
  with check (private.owns_character(character_id));

-- Player discovery, PvP and leaderboards require authenticated public reads.
create policy "characters_authenticated_read"
  on public.characters for select to authenticated using (true);
create policy "pvp_ratings_authenticated_read"
  on public.pvp_ratings for select to authenticated using (true);
create policy "leaderboards_authenticated_read"
  on public.leaderboards for select to authenticated using (true);

create policy "battle_reports_participant"
  on public.battle_reports for all to authenticated
  using (
    private.owns_character(attacker_id)
    or private.owns_character(defender_id)
  )
  with check (
    private.owns_character(attacker_id)
    or private.owns_character(defender_id)
  );

create policy "pvp_matches_participant"
  on public.pvp_matches for all to authenticated
  using (
    private.owns_character(attacker_id)
    or private.owns_character(defender_id)
  )
  with check (
    private.owns_character(attacker_id)
    or private.owns_character(defender_id)
  );

create policy "referral_rewards_participant"
  on public.referral_rewards for all to authenticated
  using (
    private.owns_character(referrer_id)
    or private.owns_character(referred_id)
  )
  with check (
    private.owns_character(referrer_id)
    or private.owns_character(referred_id)
  );

-- Hideout children inherit ownership through the hideout.
create policy "hideout_buildings_owner"
  on public.hideout_buildings for all to authenticated
  using (
    exists (
      select 1 from public.hideouts
      where hideouts.id = hideout_buildings.hideout_id
        and private.owns_character(hideouts.character_id)
    )
  )
  with check (
    exists (
      select 1 from public.hideouts
      where hideouts.id = hideout_buildings.hideout_id
        and private.owns_character(hideouts.character_id)
    )
  );

-- Clan state is visible to signed-in players; mutations stay in server actions.
create policy "clans_authenticated_read"
  on public.clans for select to authenticated using (true);
create policy "clan_members_authenticated_read"
  on public.clan_members for select to authenticated using (true);
create policy "clan_ranks_authenticated_read"
  on public.clan_ranks for select to authenticated using (true);
create policy "clan_quests_authenticated_read"
  on public.clan_quests for select to authenticated using (true);

create policy "clan_members_own_insert"
  on public.clan_members for insert to authenticated
  with check (private.owns_character(character_id));
create policy "clan_members_own_update"
  on public.clan_members for update to authenticated
  using (private.owns_character(character_id))
  with check (private.owns_character(character_id));
create policy "clan_members_own_delete"
  on public.clan_members for delete to authenticated
  using (private.owns_character(character_id));

-- Conversation data is only visible to participants.
create policy "conversations_participant"
  on public.conversations for select to authenticated
  using (private.participates_in_conversation(id));

create policy "conversation_participants_participant"
  on public.conversation_participants for select to authenticated
  using (
    private.owns_character(character_id)
    or private.participates_in_conversation(conversation_id)
  );

create policy "messages_participant"
  on public.messages for all to authenticated
  using (private.participates_in_conversation(conversation_id))
  with check (private.participates_in_conversation(conversation_id));

-- Reports are private to the reporter and staff.
create policy "player_reports_reporter"
  on public.player_reports for all to authenticated
  using (private.owns_character(reporter_id) or private.is_staff())
  with check (private.owns_character(reporter_id) or private.is_staff());

-- Administrative data stays restricted to staff accounts.
do $$
declare
  admin_table text;
begin
  foreach admin_table in array array[
    'admin_audit_logs',
    'security_events',
    'payment_events',
    'moderation_actions',
    'feature_flags'
  ]
  loop
    execute format(
      'create policy %I on public.%I for all to authenticated using (private.is_staff()) with check (private.is_staff())',
      admin_table || '_staff_only',
      admin_table
    );
  end loop;
end
$$;
