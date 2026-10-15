// GET /api/popular-keywords?limit=5
// 直近30日間でよく検索された語句を返す（5分間キャッシュ）
import { isConfigured, supabase } from './_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  if (!isConfigured()) return res.status(503).json({ error: 'Supabase is not configured' });

  const limit = Math.min(Math.max(Number.parseInt(req.query?.limit, 10) || 5, 1), 10);
  const r = await supabase('rpc/popular_keywords', {
    method: 'POST',
    body: JSON.stringify({ days: 30, max_count: limit }),
  });
  if (!r.ok) return res.status(502).json({ error: 'Failed to load' });

  const rows = await r.json();
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  return res.status(200).json({ keywords: rows.map((row) => row.keyword) });
}
