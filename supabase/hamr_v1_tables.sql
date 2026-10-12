create extension if not exists "uuid-ossp";
create table if not exists public.launches_v1 (
  id uuid primary key default uuid_generate_v4(),
  wallet_pubkey text not null,
  mint_pubkey text not null unique,
  ticker text not null,
  token_name text not null,
  chain text not null default 'solana',
  status text not null default 'launched',
  tx_signature text,
  pump_url text,
  metadata_uri text,
  dev_buy_sol numeric,
  mock boolean not null default false,
  source_x_url text,
  created_at timestamptz not null default now()
);
create index if not exists launches_v1_wallet_idx on public.launches_v1 (wallet_pubkey);
create index if not exists launches_v1_created_idx on public.launches_v1 (created_at desc);
create index if not exists launches_v1_source_x_url_idx on public.launches_v1 (source_x_url) where source_x_url is not null;

create table if not exists public.reserved_x_urls (
  x_url text primary key,
  wallet_pubkey text,
  reserved_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 minutes')
);
create index if not exists reserved_x_urls_expires_idx on public.reserved_x_urls (expires_at);

create table if not exists public.radar_signals (
  id uuid primary key default uuid_generate_v4(),
  signal_id text not null unique,
  name text not null,
  ticker text not null,
  short_description text,
  scores jsonb not null,
  launch_readiness text not null,
  concept jsonb not null,
  source text,
  detected_at timestamptz not null default now(),
  sample_tweet_count int default 0,
  expires_at timestamptz not null default (now() + interval '24 hours')
);
create index if not exists radar_signals_expires_idx on public.radar_signals (expires_at);

create table if not exists public.llm_usage (
  id uuid primary key default uuid_generate_v4(),
  wallet_pubkey text,
  provider text not null,
  model text not null,
  feature text not null,
  input_tokens int,
  output_tokens int,
  cost_usd numeric(10,6),
  fallback_reason text,
  duration_ms int,
  created_at timestamptz not null default now()
);
create index if not exists llm_usage_created_idx on public.llm_usage (created_at desc);
create index if not exists llm_usage_wallet_idx on public.llm_usage (wallet_pubkey);
create table if not exists public.cached_memes (
  id uuid primary key default uuid_generate_v4(),
  x_url text not null unique,
  x_author text not null,
  image_url text,
  summary text not null,
  meme_angle text,
  engagement_score numeric,
  batch_id uuid not null,
  cached_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 minutes')
);
create index if not exists cached_memes_expires_idx on public.cached_memes (expires_at desc);
create index if not exists cached_memes_batch_idx on public.cached_memes (batch_id);
