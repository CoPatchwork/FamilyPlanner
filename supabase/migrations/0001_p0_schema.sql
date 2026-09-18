-- P0: Household, Auth (profiles), FamilyMember, Einladungs-Flow
-- Referenz: Shared Family Planner – Technical Spec, Abschnitt 2.2, 4.1, 8

-- ---------------------------------------------------------------------------
-- 1. Household
-- ---------------------------------------------------------------------------
create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

alter table households enable row level security;

-- ---------------------------------------------------------------------------
-- 2. profiles (Erweiterung von auth.users um household_id, Name)
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  household_id uuid references households (id) on delete set null,
  email text not null,
  name text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Legt beim Signup automatisch ein leeres Profil an (noch ohne Household).
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---------------------------------------------------------------------------
-- 3. household_invites (Einladungscode-Flow, Akzeptanzkriterien Abschnitt 8:
--    genau 2 Owner pro Household, danach wird ein weiterer Code abgelehnt)
-- ---------------------------------------------------------------------------
create table if not exists household_invites (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  code text not null unique,
  created_by uuid not null references profiles (id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days'),
  used_at timestamptz,
  used_by uuid references profiles (id)
);

alter table household_invites enable row level security;

-- ---------------------------------------------------------------------------
-- 4. family_members (Abschnitt 4.1)
-- ---------------------------------------------------------------------------
create table if not exists family_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  type text not null check (type in ('adult', 'child')),
  linked_user_id uuid references profiles (id),
  name text not null,
  birth_date date,
  interests text[],
  clothing_size text,
  shoe_size text,
  gift_ideas text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table family_members enable row level security;

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists family_members_set_updated_at on family_members;
create trigger family_members_set_updated_at
  before update on family_members
  for each row execute procedure set_updated_at();

-- ---------------------------------------------------------------------------
-- 5. RLS Policies – Isolation über household_id (Spec Abschnitt 2.3)
-- ---------------------------------------------------------------------------

-- profiles: jede*r sieht das eigene Profil sowie die Profile im selben Household
create policy "profiles_select_own_or_household"
  on profiles for select
  using (
    id = auth.uid()
    or household_id = (select household_id from profiles where id = auth.uid())
  );

create policy "profiles_update_own"
  on profiles for update
  using (id = auth.uid());

-- households: sichtbar nur für Mitglieder
create policy "households_select_member"
  on households for select
  using (id = (select household_id from profiles where id = auth.uid()));

-- Household-Erstellung: jeder eingeloggte Nutzer ohne bestehendes Household darf eins anlegen
create policy "households_insert_authenticated"
  on households for insert
  to authenticated
  with check (true);

-- household_invites: nur Mitglieder des Households sehen/erstellen Einladungen
create policy "invites_select_member"
  on household_invites for select
  using (household_id = (select household_id from profiles where id = auth.uid()));

create policy "invites_insert_member"
  on household_invites for insert
  with check (household_id = (select household_id from profiles where id = auth.uid()));

-- family_members: volle CRUD-Rechte für Mitglieder des eigenen Households
create policy "family_members_select_household"
  on family_members for select
  using (household_id = (select household_id from profiles where id = auth.uid()));

create policy "family_members_insert_household"
  on family_members for insert
  with check (household_id = (select household_id from profiles where id = auth.uid()));

create policy "family_members_update_household"
  on family_members for update
  using (household_id = (select household_id from profiles where id = auth.uid()));

create policy "family_members_delete_household"
  on family_members for delete
  using (household_id = (select household_id from profiles where id = auth.uid()));

-- ---------------------------------------------------------------------------
-- 6. RPC-Funktionen für den Onboarding-Flow
-- ---------------------------------------------------------------------------

-- Legt ein neues Household an und ordnet den aufrufenden Nutzer sofort zu.
create or replace function create_household(household_name text)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  new_household_id uuid;
begin
  if (select household_id from profiles where id = auth.uid()) is not null then
    raise exception 'user_already_in_household';
  end if;

  insert into households (name) values (household_name)
  returning id into new_household_id;

  update profiles set household_id = new_household_id where id = auth.uid();

  -- Ersten Erwachsenen automatisch als FamilyMember anlegen
  insert into family_members (household_id, type, linked_user_id, name)
  select new_household_id, 'adult', auth.uid(), coalesce(name, email)
  from profiles where id = auth.uid();

  return new_household_id;
end;
$$;

-- Erzeugt einen Einladungscode für das eigene Household.
-- Schlägt fehl, wenn das Household bereits 2 Mitglieder hat (Akzeptanzkriterium Abschnitt 8).
create or replace function create_invite()
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  my_household_id uuid;
  member_count int;
  new_code text;
begin
  select household_id into my_household_id from profiles where id = auth.uid();
  if my_household_id is null then
    raise exception 'no_household';
  end if;

  select count(*) into member_count from profiles where household_id = my_household_id;
  if member_count >= 2 then
    raise exception 'household_full';
  end if;

  new_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));

  insert into household_invites (household_id, code, created_by)
  values (my_household_id, new_code, auth.uid());

  return new_code;
end;
$$;

-- Löst einen Einladungscode ein: ordnet den aufrufenden Nutzer dem Household zu.
-- Lehnt ab, wenn das Household bereits voll ist (2 Owner) oder der Code ungültig/abgelaufen ist.
create or replace function redeem_invite(invite_code text)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  target_household_id uuid;
  member_count int;
begin
  if (select household_id from profiles where id = auth.uid()) is not null then
    raise exception 'user_already_in_household';
  end if;

  select household_id into target_household_id
  from household_invites
  where code = upper(invite_code)
    and used_at is null
    and expires_at > now();

  if target_household_id is null then
    raise exception 'invalid_or_expired_code';
  end if;

  select count(*) into member_count from profiles where household_id = target_household_id;
  if member_count >= 2 then
    raise exception 'household_full';
  end if;

  update profiles set household_id = target_household_id where id = auth.uid();

  update household_invites
  set used_at = now(), used_by = auth.uid()
  where code = upper(invite_code);

  insert into family_members (household_id, type, linked_user_id, name)
  select target_household_id, 'adult', auth.uid(), coalesce(name, email)
  from profiles where id = auth.uid();

  return target_household_id;
end;
$$;
