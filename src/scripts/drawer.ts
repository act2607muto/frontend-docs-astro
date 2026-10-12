// SP：サイドバーを左からのドロワーとして開閉する
export function initDrawer() {
  const aside = document.querySelector<HTMLElement>('[data-sidebar]');
  const backdrop = document.querySelector<HTMLElement>('[data-drawer-backdrop]');
  const openBtn = document.querySelector<HTMLElement>('[data-drawer-open]');
  const closeBtn = aside?.querySelector<HTMLElement>('[data-drawer-close]');
  if (!aside || !backdrop || aside.dataset.ready !== undefined) return;
  aside.dataset.ready = '';

  const set = (open: boolean) => {
    aside.classList.toggle('is-open', open);
    backdrop.hidden = !open;
    openBtn?.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) closeBtn?.focus();
    else openBtn?.focus();
  };
  openBtn?.addEventListener('click', () => set(true));
  backdrop.addEventListener('click', () => set(false));
  closeBtn?.addEventListener('click', () => set(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && aside.classList.contains('is-open')) set(false);
  });
  // PC幅に戻ったら状態を解除
  matchMedia('(min-width: 760px)').addEventListener('change', (e) => {
    if (e.matches && aside.classList.contains('is-open')) set(false);
  });
}
