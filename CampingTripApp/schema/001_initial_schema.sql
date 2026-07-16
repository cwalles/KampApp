-- Camping Trip App — Initial Schema
-- Based on MVP Spec §6 core entities: User, Family, Trip, TripMember,
-- GearItem, ChecklistItem, MealSlot, Ingredient, ShoppingItem, LedgerEntry,
-- RigProfile, RouteLeg
--
-- Ledger unit = Family (per spec recommendation in §9)
-- Kids weighting default = 0.5 (configurable per trip, per §9)

-- ============================================================
-- EXTENSIONS
-- ============================================================
create extension if not exists "uuid-ossp";

-- ============================================================
-- FAMILIES (the ledger + packing unit)
-- ============================================================
create table families (
  id uuid primary key default uuid_generate_v4(),
  name text not null,                -- e.g. "The Van der Merwes"
  created_by uuid references auth.users(id) not null,
  created_at timestamptz default now()
);

-- Link auth.users to a family (many-to-one: multiple adults per family)
create table family_members (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid references families(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  role text default 'adult' check (role in ('adult', 'kid')),
  display_name text not null,
  created_at timestamptz default now(),
  unique (family_id, user_id)
);

-- ============================================================
-- TRIPS
-- ============================================================
create table trips (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  destination text,
  start_date date not null,
  end_date date not null,
  organiser_family_id uuid references families(id) not null,
  kids_weighting numeric default 0.5,   -- configurable per §9 open decision
  invite_code text unique default substr(md5(random()::text), 1, 8),
  status text default 'active' check (status in ('active', 'settled', 'archived')),
  created_at timestamptz default now()
);

-- Which families are part of a trip, and their headcounts
create table trip_members (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references trips(id) on delete cascade not null,
  family_id uuid references families(id) not null,
  adults_count int default 1,
  kids_count int default 0,
  joined_at timestamptz default now(),
  unique (trip_id, family_id)
);

-- ============================================================
-- MODULE A: PACKING
-- ============================================================

-- Persistent gear library, per family (not per trip)
create table gear_items (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid references families(id) on delete cascade not null,
  name text not null,
  category text not null check (category in
    ('Shelter', 'Kitchen', 'Braai/Potjie', 'Kids', 'Bedding', 'Tools', 'Consumables')),
  qty_owned int default 1,
  storage_location text,
  photo_url text,
  is_consumable boolean default false,   -- triggers "check level" prompt vs simple tick
  created_at timestamptz default now()
);

-- Items generated for a specific trip's checklist
create table checklist_items (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references trips(id) on delete cascade not null,
  gear_item_id uuid references gear_items(id),  -- null if a one-off/template item
  family_id uuid references families(id),        -- null if unassigned/communal
  name text not null,
  category text not null,
  is_communal boolean default false,
  owner_family_id uuid references families(id),  -- who's bringing it, if communal
  is_consumable boolean default false,
  state text default 'not_packed' check
    (state in ('not_packed', 'packed', 'at_camp', 'packed_home')),
  created_at timestamptz default now()
);

-- ============================================================
-- MODULE B: MEALS
-- ============================================================

create table meal_slots (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references trips(id) on delete cascade not null,
  slot_date date not null,
  slot_type text not null check (slot_type in ('breakfast', 'lunch', 'dinner', 'padkos')),
  label text,                              -- e.g. "In-laws — Nachos"
  owner_family_id uuid references families(id),  -- null = unclaimed
  headcount_override int,                   -- null = use full trip headcount
  created_at timestamptz default now()
);

create table ingredients (
  id uuid primary key default uuid_generate_v4(),
  meal_slot_id uuid references meal_slots(id) on delete cascade not null,
  name text not null,
  qty_per_person numeric not null,
  unit text
);

create table shopping_items (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references trips(id) on delete cascade not null,
  meal_slot_id uuid references meal_slots(id),  -- null if communal staple
  name text not null,
  total_qty numeric,
  unit text,
  is_communal_staple boolean default false,
  assigned_family_id uuid references families(id),
  purchased boolean default false
);

-- ============================================================
-- MODULE C: LEDGER
-- ============================================================

create table ledger_entries (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references trips(id) on delete cascade not null,
  family_id uuid references families(id) not null,   -- who paid
  amount numeric not null,
  category text not null check (category in
    ('Site fees', 'Fuel', 'Food', 'Gas/consumables', 'Activities', 'Other')),
  description text,
  is_sponsored boolean default false,   -- excluded from split if true
  created_at timestamptz default now()
);

-- ============================================================
-- MODULE D: ROUTE & TOW
-- ============================================================

create table rig_profiles (
  id uuid primary key default uuid_generate_v4(),
  family_id uuid references families(id) on delete cascade not null,
  vehicle_name text,
  tow_consumption_l_100km numeric,
  tank_size_l numeric,
  daily_max_km numeric default 650,
  created_at timestamptz default now()
);

create table route_legs (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references trips(id) on delete cascade not null,
  leg_order int not null,
  start_location text,
  end_location text,
  distance_km numeric,
  suggested_stop_zone text,
  estimated_eta timestamptz,
  notes text,   -- e.g. "great play area, avoid on long weekends"
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- All access scoped to: user belongs to a family that is a trip_member
-- ============================================================

alter table families enable row level security;
alter table family_members enable row level security;
alter table trips enable row level security;
alter table trip_members enable row level security;
alter table gear_items enable row level security;
alter table checklist_items enable row level security;
alter table meal_slots enable row level security;
alter table ingredients enable row level security;
alter table shopping_items enable row level security;
alter table ledger_entries enable row level security;
alter table rig_profiles enable row level security;
alter table route_legs enable row level security;

-- Helper: is the current user in this family?
create or replace function is_family_member(fam_id uuid)
returns boolean as $$
  select exists (
    select 1 from family_members
    where family_id = fam_id and user_id = auth.uid()
  );
$$ language sql security definer;

-- Helper: is the current user part of this trip (via any of their families)?
create or replace function is_trip_member(t_id uuid)
returns boolean as $$
  select exists (
    select 1 from trip_members tm
    join family_members fm on fm.family_id = tm.family_id
    where tm.trip_id = t_id and fm.user_id = auth.uid()
  );
$$ language sql security definer;

-- Families: members can see/edit their own family
create policy "family members can view their family"
  on families for select using (is_family_member(id));
create policy "family members can update their family"
  on families for update using (is_family_member(id));
create policy "authenticated users can create a family"
  on families for insert with check (auth.uid() = created_by);

-- Family members: visible to same-family users
create policy "view own family members"
  on family_members for select using (is_family_member(family_id));
-- A user may only ever add themself (not arbitrary other users) as a
-- family member — covers both creating a new family and, later, being
-- invited into an existing one.
create policy "user can add themself as a family member"
  on family_members for insert with check (auth.uid() = user_id);

-- Trips: visible/editable to trip members only
create policy "trip members can view trip"
  on trips for select using (is_trip_member(id));
create policy "organiser can update trip"
  on trips for update using (is_family_member(organiser_family_id));
create policy "authenticated users can create trip"
  on trips for insert with check (is_family_member(organiser_family_id));

-- Trip members: visible to other trip members (so you can see who's on the trip)
create policy "trip members can view trip roster"
  on trip_members for select using (is_trip_member(trip_id));
create policy "family can join a trip"
  on trip_members for insert with check (is_family_member(family_id));

-- Gear items: private to owning family
create policy "family manages own gear library"
  on gear_items for all using (is_family_member(family_id));

-- Checklist items: any trip member can view/tick; only assigned family or
-- organiser should reassign (kept simple for MVP: any trip member can edit)
create policy "trip members manage checklist items"
  on checklist_items for all using (is_trip_member(trip_id));

-- Meal slots, ingredients, shopping items, ledger, route legs:
-- same pattern — scoped to trip membership
create policy "trip members manage meal slots"
  on meal_slots for all using (is_trip_member(trip_id));
create policy "trip members manage ingredients"
  on ingredients for all using (
    exists (select 1 from meal_slots where meal_slots.id = meal_slot_id
            and is_trip_member(meal_slots.trip_id))
  );
create policy "trip members manage shopping items"
  on shopping_items for all using (is_trip_member(trip_id));
create policy "trip members manage ledger entries"
  on ledger_entries for all using (is_trip_member(trip_id));
create policy "trip members manage route legs"
  on route_legs for all using (is_trip_member(trip_id));

-- Rig profiles: private to owning family
create policy "family manages own rig profile"
  on rig_profiles for all using (is_family_member(family_id));
