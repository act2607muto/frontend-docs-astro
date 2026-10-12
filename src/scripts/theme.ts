// テーマ切替（html[data-theme] / localStorage "hcg-theme"）
// 初期テーマは BaseLayout の <head> 内インラインスクリプトでちらつき前に設定済み
const KEY = 'hcg-theme';

const getTheme = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

function syncLabels() {
  const label = getTheme() === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え';
  document.querySelectorAll('[data-theme-toggle]').forEach((b) => b.setAttribute('aria-label', label));
}

export function initThemeToggles() {
  syncLabels();
  document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]:not([data-ready])').forEach((btn) => {
    btn.dataset.ready = '';
    btn.addEventListener('click', () => {
      const next = getTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem(KEY, next); } catch { /* 保存できない環境では無視 */ }
      syncLabels();
    });
  });
}
