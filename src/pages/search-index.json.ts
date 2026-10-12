// 検索用データ（ビルド時に search-index.json として書き出す）
import type { APIRoute } from 'astro';
import { items } from '../lib/data';
import { url } from '../lib/url';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify(
      items.map(({ type, slug, name, summary, keywords, categoryName, hasDetail }) => ({
        type, slug, name, summary, keywords, categoryName, hasDetail, url: url.item({ type, slug }),
      })),
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  );
