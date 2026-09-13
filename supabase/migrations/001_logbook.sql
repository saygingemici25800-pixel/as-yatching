-- ============================================================================
-- SEYİR DEFTERİ — misafir fotoğraf panosu
-- ----------------------------------------------------------------------------
-- Supabase SQL Editor'de bu dosyanın tamamını çalıştırın (bir kez).
-- Storage bucket'ı da aşağıda oluşturuluyor; ayrıca panelden açmaya gerek yok.
--
-- Akış: misafir yükler (status = 'pending') → Serkan'a e-posta gider →
-- e-postadaki bağlantı token'ı ile status 'approved' / 'rejected' olur →
-- yalnızca 'approved' kayıtlar sitede görünür.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tablo
-- ---------------------------------------------------------------------------
do $$ begin
  create type logbook_status as enum ('pending', 'approved', 'rejected');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.logbook_entries (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  -- Storage'daki dosya yolu: logbook/<uuid>.webp (bucket adı hariç)
  photo_path    text not null,
  note          text not null default '' check (char_length(note) <= 140),
  name          text not null default '' check (char_length(name) <= 40),
  trip_date     date not null,
  status        logbook_status not null default 'pending',
  -- E-postadaki onay/ret bağlantısının tek kullanımlık anahtarı
  approve_token text not null unique,
  -- Ziyaretçi IP'sinin tuzlu SHA-256 özeti (ham IP saklanmaz — KVKK)
  ip_hash       text not null default '',
  -- Karar anı; token 30 gün sonra geçersiz sayılır (created_at üzerinden)
  decided_at    timestamptz
);

create index if not exists logbook_entries_approved_idx
  on public.logbook_entries (status, created_at desc);

create index if not exists logbook_entries_ip_idx
  on public.logbook_entries (ip_hash, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS: tablo yalnızca service_role ile okunur/yazılır.
-- Sunucu tarafı (lib/logbook-server.ts) service role anahtarını kullanır;
-- tarayıcıya anon anahtar HİÇ verilmiyor, bu yüzden public policy yok.
-- ---------------------------------------------------------------------------
alter table public.logbook_entries enable row level security;

-- (Bilinçli olarak policy yok: RLS açık + policy yok = anon/authenticated
--  erişimi tamamen kapalı. service_role RLS'i atlar.)

-- ---------------------------------------------------------------------------
-- Storage bucket — private
-- Onaylı fotoğraflar imzalı URL (7 gün) ile sunulur.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('logbook', 'logbook', false, 10485760, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Bucket'a da policy yazılmıyor: yükleme ve imzalı URL üretimi yalnızca
-- service_role ile, sunucu tarafında yapılıyor.
