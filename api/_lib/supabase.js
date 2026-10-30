// Vercel の API から Supabase（REST API）を呼び出すための共通処理
// 環境変数 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY は Vercel のプロジェクト設定で登録する（ブラウザには出さない）
import items from '../../src/data/items.json' with { type: 'json' };

export const isConfigured = () => !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export function supabase(path, init = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return fetch(`${process.env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...init.headers },
  });
}

/** 検索語をそろえる（全角英数→半角・小文字・空白の整理）。不正なら空文字 */
export function normalizeKeyword(raw) {
  if (typeof raw !== 'string') return '';
  const s = raw.normalize('NFKC').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
  return s.length >= 1 && s.length <= 40 ? s : '';
}

// 辞典の項目名だけを記録・表示する（検索結果から選ばれた項目を数える。でたらめな語句で「よく調べるキーワード」が荒らされないように）
// キーは normalizeKeyword でそろえた名前、値は表示用の元の名前
const itemNames = new Map(items.map((it) => [normalizeKeyword(it.name), it.name]));

export const itemName = (keyword) => itemNames.get(keyword);
