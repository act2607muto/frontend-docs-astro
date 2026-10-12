// アコーディオン（<button class="acc__trigger" aria-expanded aria-controls> ＋ hidden パネル）
// [data-accordion] の範囲ごとに制御する。data-single があれば1つずつ開く

const panelOf = (btn: Element) => document.getElementById(btn.getAttribute('aria-controls') ?? '');

export function setOpen(btn: Element, open: boolean) {
  btn.setAttribute('aria-expanded', String(open));
  const panel = panelOf(btn);
  if (panel) panel.hidden = !open;
}

const triggers = (container: Element) => [...container.querySelectorAll('.acc__trigger')];

export function initAccordions() {
  document.querySelectorAll<HTMLElement>('[data-accordion]:not([data-ready])').forEach((container) => {
    container.dataset.ready = '';
    const single = container.hasAttribute('data-single');
    container.addEventListener('click', (e) => {
      const btn = (e.target as Element).closest('.acc__trigger');
      if (!btn || !container.contains(btn)) return;
      const open = btn.getAttribute('aria-expanded') !== 'true';
      if (single && open) triggers(container).forEach((b) => b !== btn && setOpen(b, false));
      setOpen(btn, open);
    });
  });
}

export const openAll = (container: Element) => triggers(container).forEach((b) => setOpen(b, true));
export const closeAll = (container: Element) => triggers(container).forEach((b) => setOpen(b, false));
