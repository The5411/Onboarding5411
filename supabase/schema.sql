-- Onboarding 5411 — esquema inicial de Supabase.
-- Correr una sola vez en el SQL Editor del proyecto (Supabase Dashboard → SQL Editor → New query).

-- ─────────────────────────────────────────────────────────
-- profiles: rol de cada usuario autenticado (editor | viewer)
-- ─────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'viewer' check (role in ('editor', 'viewer')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: leer la propia fila"
  on public.profiles for select
  using (auth.uid() = id);

-- Crea el profile automáticamente cada vez que alguien se registra.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────
-- Estructura de contenido: mismo árbol que nav-tree.ts, en filas.
-- No incluye "empresa.empleados" (Google Sheet) — ese se queda como código.
-- ─────────────────────────────────────────────────────────
create table public.tracks (
  id text primary key,
  label text not null,
  icon_name text not null,
  default_open boolean not null default false,
  position int not null
);

create table public.nav_items (
  id text primary key,
  track_id text not null references public.tracks(id) on delete cascade,
  label text not null,
  icon_name text not null,
  view text not null check (view in ('doc', 'directory', 'checklist', 'flow')),
  layout text check (layout in ('flat', 'accordion')),
  -- forma de `content` según `view`:
  --   doc        -> { "sections": [{ "id", "title", "html", "images"? }] }
  --   directory  -> { "dataSource": { "type": "static", "columns": [...], "rows": [...] } }
  --   checklist  -> { "items": [{ "id", "label", "href"? }] }
  --   flow       -> { "stages": FlowStage[], "faqs": [{ "id", "q", "a" }] }
  content jsonb not null default '{}'::jsonb,
  position int not null
);

alter table public.tracks enable row level security;
alter table public.nav_items enable row level security;

create policy "tracks: lectura autenticada"
  on public.tracks for select
  using (auth.role() = 'authenticated');

create policy "nav_items: lectura autenticada"
  on public.nav_items for select
  using (auth.role() = 'authenticated');

create policy "tracks: escritura solo editores"
  on public.tracks for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'editor'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'editor'));

create policy "nav_items: escritura solo editores"
  on public.nav_items for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'editor'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'editor'));

-- ─────────────────────────────────────────────────────────
-- Para asignar el rol "editor" a alguien (a mano, desde el
-- SQL Editor), una vez que esa persona ya se registró:
--
--   update public.profiles set role = 'editor' where email = 'nombre@the5411.com';
-- ─────────────────────────────────────────────────────────
