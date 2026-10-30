// POST /api/search-log  { "keyword": "display" }
// 検索結果から項目を開いたときに、選ばれた項目の名前を記録する
import { isConfigured, itemName, normalizeKeyword, supabase } from './_lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  if (!isConfigured()) return res.status(503).json({ error: 'Supabase is not configured' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const keyword = normalizeKeyword(body?.keyword);
  if (!keyword || !itemName(keyword)) return res.status(400).json({ error: 'Invalid keyword' });

  const r = await supabase('search_logs', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ keyword }),
  });
  if (!r.ok) return res.status(502).json({ error: 'Failed to save' });
  return res.status(204).end();
}
