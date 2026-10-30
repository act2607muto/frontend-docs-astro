// GET /api/popular-keywords?limit=5
// 直近30日間で検索結果からよく選ばれた項目の名前を返す（5分間キャッシュ）
import { isConfigured, itemName, supabase } from './_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  if (!isConfigured()) return res.status(503).json({ error: 'Supabase is not configured' });

  const limit = Math.min(Math.max(Number.parseInt(req.query?.limit, 10) || 5, 1), 10);
  const r = await supabase('rpc/popular_keywords', {
    method: 'POST',
    // 以前は入力した語句をそのまま記録していたので、項目名以外の行が混ざる。多めに取って項目名だけに絞る
    body: JSON.stringify({ days: 30, max_count: 100 }),
  });
  if (!r.ok) return res.status(502).json({ error: 'Failed to load' });

  const rows = await r.json();
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  return res.status(200).json({ keywords: rows.map((row) => itemName(row.keyword)).filter(Boolean).slice(0, limit) });
}
