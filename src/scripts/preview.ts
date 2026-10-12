// プレビュー iframe の高さを、中から送られてくる本文の高さに合わせる
const MIN_HEIGHT = 60;
let ready = false;

export function initPreviewResize() {
  if (ready) return;
  ready = true;
  window.addEventListener('message', (e) => {
    const h = (e.data as { hcgPreviewHeight?: unknown } | null)?.hcgPreviewHeight;
    if (typeof h !== 'number') return;
    document.querySelectorAll<HTMLIFrameElement>('iframe[data-preview]').forEach((frame) => {
      if (frame.contentWindow === e.source) frame.style.height = `${Math.max(MIN_HEIGHT, h)}px`;
    });
  });
}
