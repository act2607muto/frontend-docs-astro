// 検索（name / slug / keywords / summary / カテゴリ名が対象）
// 検索用データ（search-index.json）は最初にフォーカスしたときに1度だけ読み込む

export interface SearchItem {
  type: 'html' | 'css' | 'js';
  slug: string;
  name: string;
  summary: string;
  keywords: string[];
  categoryName: string;
  hasDetail: boolean;
  url: string;
}

let indexPromise: Promise<SearchItem[]> | undefined;
const loadIndex = (src: string) =>
  (indexPromise ??= fetch(src).then((r) => {
    if (!r.ok) throw new Error(`search-index.json の読み込みに失敗しました (${r.status})`);
    return r.json() as Promise<SearchItem[]>;
  }));

/**
 * スコア：完全一致100 > 前方一致70 > 部分一致50 > キーワード40 > 説明30 > カテゴリ15
 * 解説済み項目は +1。`<` `>` は無視する（`<h1>` でもヒット）。
 */
export function search(items: SearchItem[], query: string, limit: number): SearchItem[] {
  const q = query.trim().toLowerCase().replace(/[<>]/g, '');
  if (!q) return [];
  const hits: [number, SearchItem][] = [];
  for (const it of items) {
    const name = it.name.toLowerCase();
    let s = 0;
    if (name === q || it.slug === q) s = 100;
    else if (name.startsWith(q)) s = 70;
    else if (name.includes(q)) s = 50;
    if (it.keywords.some((k) => k.toLowerCase().includes(q))) s = Math.max(s, 40);
    if (it.summary.toLowerCase().includes(q)) s = Math.max(s, 30);
    if (it.categoryName.toLowerCase().includes(q)) s = Math.max(s, 15);
    if (s) hits.push([s + (it.hasDetail ? 1 : 0), it]);
  }
  // 同点は元の並び順を保つ（Array.prototype.sort は安定ソート）
  return hits.sort((a, b) => b[0] - a[0]).slice(0, limit).map((x) => x[1]);
}

const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ESC[c]!);

let uid = 0;

/** 検索結果から項目を開いたときに、検索語を記録する（Vercel の API。ページ移動を妨げないよう sendBeacon で送る） */
function logSearch(logUrl: string, query: string) {
  const keyword = query.trim();
  if (!keyword || !logUrl || !navigator.sendBeacon) return;
  try {
    navigator.sendBeacon(logUrl, new Blob([JSON.stringify({ keyword })], { type: 'application/json' }));
  } catch { /* 記録できなくても検索には影響させない */ }
}

function setup(el: HTMLElement) {
  const input = el.querySelector('input')!;
  const drop = el.querySelector<HTMLElement>('.search__dropdown')!;
  const { indexUrl = '', logUrl = '', emptyText = '', limit = '8' } = el.dataset;
  const id = `search-list-${++uid}`;
  drop.id = id;
  input.setAttribute('aria-controls', id);

  let items: SearchItem[] = [];
  let results: SearchItem[] = [];
  let active = 0;

  const close = () => {
    drop.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  };

  const render = async () => {
    const q = input.value.trim();
    if (!q) return close();
    try { items = await loadIndex(indexUrl); } catch (e) { console.error(e); return; }
    if (input.value.trim() !== q) return; // 読み込み中に入力が変わった
    results = search(items, q, Number(limit));
    active = Math.min(active, Math.max(results.length - 1, 0));
    drop.innerHTML = `
      <div class="search__label">「${esc(q)}」の検索結果 ${results.length}件</div>
      <div role="listbox" aria-label="検索結果">
        ${results.map((it, i) => `
          <a class="search__result" role="option" id="${id}-${i}" href="${esc(it.url)}" aria-selected="${i === active}">
            <span class="tag">${it.type.toUpperCase()}</span>
            <span class="search__body">
              <span class="search__head"><span class="search__name">${esc(it.name)}</span><span class="search__cat">${esc(it.categoryName)}</span></span>
              <span class="search__summary">${esc(it.summary)}</span>
            </span>
          </a>`).join('')}
      </div>
      ${results.length ? '' : `<div class="search__empty">${esc(emptyText)}</div>`}`;
    drop.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    if (results.length) input.setAttribute('aria-activedescendant', `${id}-${active}`);
    else input.removeAttribute('aria-activedescendant');
  };

  const move = (d: number) => {
    if (!results.length) return;
    active = Math.max(0, Math.min(active + d, results.length - 1));
    drop.querySelectorAll('.search__result').forEach((a, i) => a.setAttribute('aria-selected', String(i === active)));
    input.setAttribute('aria-activedescendant', `${id}-${active}`);
    drop.querySelector(`#${id}-${active}`)?.scrollIntoView({ block: 'nearest' });
  };

  input.addEventListener('input', () => { active = 0; render(); });
  input.addEventListener('focus', () => { loadIndex(indexUrl).catch(() => {}); render(); });
  input.addEventListener('keydown', (e) => {
    if (e.isComposing) return; // 日本語変換中のEnterは無視
    if (e.key === 'ArrowDown') { e.preventDefault(); if (drop.hidden) render(); else move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter' && !drop.hidden && results[active]) { e.preventDefault(); logSearch(logUrl, input.value); location.href = results[active]!.url; }
    else if (e.key === 'Escape') close();
  });
  // クリック時に入力欄のフォーカスを外さない（Safari ではリンクにフォーカスが移らないため）
  drop.addEventListener('mousedown', (e) => e.preventDefault());
  // 候補をクリックして項目を開いたときも検索語を記録する
  drop.addEventListener('click', (e) => { if ((e.target as Element).closest('.search__result')) logSearch(logUrl, input.value); });
  el.addEventListener('focusout', (e) => { if (!el.contains(e.relatedTarget as Node | null)) close(); });
}

export function initSearchBoxes() {
  document.querySelectorAll<HTMLElement>('[data-search]:not([data-ready])').forEach((el) => {
    el.dataset.ready = '';
    setup(el);
  });
}

/** 検索欄に語句を入れて候補を表示する（トップの「よく調べるキーワード」用） */
export function setQuery(el: HTMLElement, q: string) {
  const input = el.querySelector('input')!;
  input.value = q;
  input.focus();
  input.dispatchEvent(new Event('input'));
}
