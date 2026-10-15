// プレビュー iframe からのメッセージ（本文の高さ・console の出力）を受け取って反映する
const MIN_HEIGHT = 60;
const EMPTY = '<li class="console__empty">console.log() の出力がここに表示されます</li>';
let ready = false;

interface PreviewMessage {
  hcgPreviewHeight?: unknown;
  hcgConsole?: { level?: string; text?: unknown };
}

declare global {
  interface Window { __hcgPreviewQueue?: MessageEvent[] | null }
}

function handle(e: MessageEvent) {
  const { hcgPreviewHeight: h, hcgConsole: log } = (e.data ?? {}) as PreviewMessage;
  if (typeof h !== 'number' && !log) return;
  document.querySelectorAll<HTMLIFrameElement>('iframe[data-preview]').forEach((frame) => {
    if (frame.contentWindow !== e.source) return;
    if (typeof h === 'number') frame.style.height = `${Math.max(MIN_HEIGHT, h)}px`;
    const lines = frame.closest('[data-preview-box]')?.querySelector('.console__lines');
    if (log && lines) {
      lines.querySelector('.console__empty')?.remove();
      const li = document.createElement('li');
      const level = ['log', 'info', 'warn', 'error'].includes(String(log.level)) ? log.level : 'log';
      li.className = `console__line console__line--${level}`;
      li.textContent = String(log.text);
      lines.append(li);
    }
  });
}

export function initPreview() {
  if (ready) return;
  ready = true;

  // BaseLayout の <head> でためておいた、読み込み前に届いたメッセージを先に反映する
  const queued = window.__hcgPreviewQueue ?? [];
  window.__hcgPreviewQueue = null;
  queued.forEach(handle);
  window.addEventListener('message', handle);

  // 「もう一度実行」：コンソールを空にして iframe を読み込み直す
  document.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest('[data-rerun]');
    const box = btn?.closest('[data-preview-box]');
    const frame = box?.querySelector<HTMLIFrameElement>('iframe[data-preview]');
    if (!box || !frame) return;
    box.querySelector('.console__lines')!.innerHTML = EMPTY;
    frame.srcdoc = frame.srcdoc;
  });
}
