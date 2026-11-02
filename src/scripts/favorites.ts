// お気に入り（localStorage "hcg-favorites" に項目 ID を新しい順で保存）
const KEY = 'hcg-favorites';

export function getFavorites(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function save(ids: string[]) {
  try { localStorage.setItem(KEY, JSON.stringify(ids)); } catch { /* 保存できない環境では無視 */ }
  document.dispatchEvent(new CustomEvent('favorites:change'));
}

export function isFavorite(id: string) {
  return getFavorites().includes(id);
}

export function toggleFavorite(id: string): boolean {
  const ids = getFavorites().filter((x) => x !== id);
  const on = !isFavorite(id);
  save(on ? [id, ...ids] : ids);
  return on;
}

export function removeFavorite(id: string) {
  save(getFavorites().filter((x) => x !== id));
}

/** [data-fav-toggle="<id>"] のボタンを初期化 */
export function initFavoriteButtons() {
  const sync = () =>
    document.querySelectorAll<HTMLButtonElement>('[data-fav-toggle]').forEach((btn) => {
      const on = isFavorite(btn.dataset.favToggle!);
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on ? 'お気に入りから外す' : 'お気に入りに追加');
      const label = btn.querySelector('[data-fav-label]');
      if (label) label.textContent = on ? 'お気に入り済み' : 'お気に入り';
    });
  document.querySelectorAll<HTMLButtonElement>('[data-fav-toggle]').forEach((btn) =>
    btn.addEventListener('click', () => toggleFavorite(btn.dataset.favToggle!)),
  );
  document.addEventListener('favorites:change', sync);
  window.addEventListener('storage', (e) => { if (e.key === KEY) sync(); });
  sync();
}
