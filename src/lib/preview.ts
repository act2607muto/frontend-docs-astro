// 実行結果プレビュー用の HTML 文書（iframe の srcdoc）をビルド時に組み立てる
// 将来「コード編集＋リアルタイムプレビュー」に差し替えるときも、この関数をブラウザ側で再利用できる
import type { CodeSet } from './data';

const BASE_STYLE =
  'body{margin:0;padding:20px 24px;font-family:system-ui,-apple-system,"Hiragino Sans","Noto Sans JP",sans-serif;color:#1a1a1a;background:#fff;line-height:1.6;font-size:15px}';

// iframe 内で実行し、本文の高さを親に通知する（受け取り側は src/scripts/preview.ts）
const RESIZE_SCRIPT =
  '<script>(function(){var b=document.body,last=0;function s(){var h=Math.ceil(Math.max(b.scrollHeight,b.getBoundingClientRect().height));if(h!==last){last=h;parent.postMessage({hcgPreviewHeight:h},"*")}}addEventListener("load",s);new ResizeObserver(s).observe(b)})()<\/script>';

// サンプル内の画像ファイル名（photo.jpg など）を、ファイル名入りのプレースホルダー画像に置き換える
// 空白は srcset の区切りと誤認されるため %20 にする
const placeholderImg = (name: string) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='200'><rect width='100%25' height='100%25' fill='%23d9d4cc'/><text x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%23776f63' text-anchor='middle' dominant-baseline='middle'>${name}</text></svg>`.replace(/ /g, '%20');
const withPlaceholders = (src: string) => src.replace(/[\w-]+\.(?:jpe?g|png|webp|gif)\b/g, placeholderImg);

/**
 * fullDocument=true の場合は html をそのまま文書として使い、css は外部CSSを読み込んだ状態として head に差し込む
 */
export function buildSrcdoc({ html, css }: CodeSet, fullDocument = false): string {
  const body = withPlaceholders(html || '');
  const style = withPlaceholders(css || '');
  if (fullDocument) {
    const tag = `<style>${BASE_STYLE}${style}</style>`;
    const doc = body.includes('</head>') ? body.replace('</head>', `${tag}</head>`) : tag + body;
    return doc.includes('</body>') ? doc.replace('</body>', `${RESIZE_SCRIPT}</body>`) : doc + RESIZE_SCRIPT;
  }
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>${BASE_STYLE}${style}</style></head><body>${body}${RESIZE_SCRIPT}</body></html>`;
}
