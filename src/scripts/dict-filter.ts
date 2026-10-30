// 辞典一覧の絞り込み（そのページの辞典だけが対象。名前・slug・キーワード・説明に部分一致）
// 絞り込み中は一致したカテゴリを開き、一致なしのカテゴリは隠す。解除すると絞り込み前の開閉状態に戻す
import { setOpen } from './accordion';

/** 大文字小文字・全角半角を区別しない。`<` `>` は無視する（`<h1>` でもヒット） */
const normalize = (s: string) => s.normalize('NFKC').toLowerCase().replace(/[<>]/g, '').trim();

export function initDictFilter(cats: Element) {
  const input = document.querySelector<HTMLInputElement>('[data-dict-filter]');
  const clear = document.querySelector<HTMLButtonElement>('[data-dict-filter-clear]');
  const count = document.querySelector<HTMLElement>('[data-dict-count]');
  const empty = document.querySelector<HTMLElement>('[data-dict-empty]');
  if (!input) return;

  const sections = [...cats.querySelectorAll<HTMLElement>('.dict-cat')].map((el) => ({
    el,
    trigger: el.querySelector('.acc__trigger')!,
    rows: [...el.querySelectorAll<HTMLElement>('li[data-filter-text]')].map((li) => ({
      li,
      text: normalize(li.dataset.filterText ?? ''),
    })),
  }));
  // 絞り込みを始める直前の開閉状態（解除時に戻す）
  let saved: boolean[] | null = null;

  const apply = () => {
    const q = normalize(input.value);
    if (clear) clear.hidden = !input.value;
    if (!q) {
      if (!saved) return;
      sections.forEach((s, i) => {
        s.el.hidden = false;
        s.rows.forEach((r) => (r.li.hidden = false));
        setOpen(s.trigger, saved![i]!);
      });
      saved = null;
      if (count) count.textContent = count.dataset.default ?? '';
      if (empty) empty.hidden = true;
      return;
    }
    saved ??= sections.map((s) => s.trigger.getAttribute('aria-expanded') === 'true');
    let hits = 0;
    for (const s of sections) {
      let n = 0;
      for (const r of s.rows) {
        const match = r.text.includes(q);
        r.li.hidden = !match;
        if (match) n++;
      }
      s.el.hidden = n === 0;
      if (n) setOpen(s.trigger, true);
      hits += n;
    }
    if (count) count.textContent = `${hits}件ヒット`;
    if (empty) empty.hidden = hits > 0;
  };

  input.addEventListener('input', apply);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && input.value) {
      e.preventDefault();
      input.value = '';
      apply();
    }
  });
  clear?.addEventListener('click', () => {
    input.value = '';
    apply();
    input.focus();
  });
  // 戻るボタンなどで入力値が復元されたときにも反映する
  if (input.value) apply();
}
