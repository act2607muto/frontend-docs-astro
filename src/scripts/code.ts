// コードブロックのコピーボタン
async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // 非セキュアコンテキスト向けの代替
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.append(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

export function initCopyButtons() {
  document.querySelectorAll<HTMLElement>('[data-code]:not([data-ready])').forEach((block) => {
    block.dataset.ready = '';
    const btn = block.querySelector<HTMLButtonElement>('[data-copy]')!;
    const idle = btn.querySelector<HTMLElement>('.code__copy-idle')!;
    const done = btn.querySelector<HTMLElement>('.code__copy-done')!;
    let timer: number | undefined;
    btn.addEventListener('click', async () => {
      const code = [...block.querySelectorAll('.code__src')].map((l) => l.textContent ?? '').join('\n');
      await copyText(code);
      idle.hidden = true;
      done.hidden = false;
      clearTimeout(timer);
      timer = window.setTimeout(() => { idle.hidden = false; done.hidden = true; }, 1600);
    });
  });
}
