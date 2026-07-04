create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text not null,
  role text not null check (role in ('pemilik', 'anak_kos')),
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'anak_kos')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists kamar (
  id uuid primary key default gen_random_uuid(),
  nomor text not null,
  tipe text not null default 'Standar',
  harga numeric not null default 0,
  status text not null default 'kosong' check (status in ('kosong', 'terisi')),
  created_at timestamptz default now()
);

create table if not exists penyewa (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  nama text not null,
  kontak text,
  kamar_id uuid references kamar(id) on delete set null,
  mulai_sewa date,
  created_at timestamptz default now()
);

create table if not exists pembayaran (
  id uuid primary key default gen_random_uuid(),
  penyewa_id uuid references penyewa(id) on delete cascade not null,
  bulan text not null,
  jumlah numeric not null default 0,
  status text not null default 'belum' check (status in ('belum', 'lunas')),
  tanggal_bayar date,
  created_at timestamptz default now()
);


alter table profiles enable row level security;
alter table kamar enable row level security;
alter table penyewa enable row level security;
alter table pembayaran enable row level security;

create or replace function public.is_pemilik()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'pemilik'
  );
$$ language sql security definer stable;

create policy "profiles_select_own_or_pemilik" on profiles
  for select using (id = auth.uid() or public.is_pemilik());
create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());


create policy "kamar_select_all" on kamar
  for select using (auth.role() = 'authenticated');
create policy "kamar_write_pemilik" on kamar
  for all using (public.is_pemilik()) with check (public.is_pemilik());


create policy "penyewa_select_pemilik" on penyewa
  for select using (public.is_pemilik());
create policy "penyewa_select_own" on penyewa
  for select using (user_id = auth.uid());
create policy "penyewa_write_pemilik" on penyewa
  for all using (public.is_pemilik()) with check (public.is_pemilik());


create policy "pembayaran_all_pemilik" on pembayaran
  for all using (public.is_pemilik()) with check (public.is_pemilik());
create policy "pembayaran_select_own" on pembayaran
  for select using (
    exists (select 1 from penyewa where penyewa.id = pembayaran.penyewa_id and penyewa.user_id = auth.uid())
  );
create policy "pembayaran_insert_own" on pembayaran
  for insert with check (
    exists (select 1 from penyewa where penyewa.id = pembayaran.penyewa_id and penyewa.user_id = auth.uid())
  );


insert into kamar (nomor, tipe, harga, status) values
  ('01', 'Standar', 750000, 'kosong'),
  ('02', 'Standar', 750000, 'kosong'),
  ('03', 'AC', 1000000, 'kosong')
on conflict do nothing;
