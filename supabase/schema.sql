-- FRONTEND-DOCS（Astro 版）：検索履歴と「よく調べるキーワード」
-- Supabase の SQL Editor に貼り付けて実行してください。

-- 検索履歴（検索結果からどの項目を選んで開いたか。keyword には項目名が入る）
create table if not exists public.search_logs (
  id bigint generated always as identity primary key,
  keyword text not null check (char_length(keyword) between 1 and 40),
  created_at timestamptz not null default now()
);

create index if not exists search_logs_created_at_idx on public.search_logs (created_at desc);

-- RLS を有効にし、ポリシーは作らない
-- → ブラウザ用の anon キーでは読み書きできず、Vercel の API（service_role キー）からだけ操作できる
alter table public.search_logs enable row level security;

-- 直近 days 日間でよく選ばれた項目名を max_count 件返す
create or replace function public.popular_keywords(days int default 30, max_count int default 5)
returns table (keyword text, count bigint)
language sql
stable
set search_path = public
as $$
  select keyword, count(*) as count
  from search_logs
  where created_at > now() - make_interval(days => days)
  group by keyword
  order by count(*) desc, max(created_at) desc
  limit max_count;
$$;

revoke execute on function public.popular_keywords(int, int) from public, anon, authenticated;
