// シンタックスハイライト（VS Code Light+ / Dark+ 配色）。ビルド時にトークン分割して HTML に書き出す

export type TokenClass =
  | 'text' | 'punct' | 'tag' | 'attr' | 'val' | 'cmt'
  | 'sel' | 'prop' | 'cval' | 'num' | 'kw' | 'fn'
  | 'str' | 'stor' | 'var';
export interface Token { t: string; c: TokenClass }
type Push = (t: string, c: TokenClass) => void;

export function tokHTML(src: string): Token[] {
  const out: Token[] = [];
  const push: Push = (t, c) => { if (t) out.push({ t, c }); };
  const n = src.length;
  let i = 0;
  while (i < n) {
    if (src.startsWith('<!--', i)) {
      const e = src.indexOf('-->', i);
      const j = e < 0 ? n : e + 3;
      push(src.slice(i, j), 'cmt'); i = j; continue;
    }
    if (src[i] === '<') {
      let j = i + 1;
      if (src[j] === '/' || src[j] === '!') j++;
      push(src.slice(i, j), 'punct'); i = j;
      const m = /^[A-Za-z][\w-]*/.exec(src.slice(i));
      if (m) { push(m[0], 'tag'); i += m[0].length; }
      while (i < n && src[i] !== '>') {
        const rest = src.slice(i);
        let mm: RegExpExecArray | null;
        let len: number;
        if ((mm = /^\s+/.exec(rest))) { push(mm[0], 'text'); len = mm[0].length; }
        else if ((mm = /^\/(?=>)/.exec(rest))) { push(mm[0], 'punct'); len = 1; }
        else if ((mm = /^("[^"]*"|'[^']*')/.exec(rest))) { push(mm[0], 'val'); len = mm[0].length; }
        else if ((mm = /^[^\s=>/"']+/.exec(rest))) { push(mm[0], 'attr'); len = mm[0].length; }
        else { push(rest[0]!, 'text'); len = 1; }
        i += len;
      }
      if (i < n) { push('>', 'punct'); i++; }
      continue;
    }
    let j = src.indexOf('<', i);
    if (j < 0) j = n;
    push(src.slice(i, j), 'text'); i = j;
  }
  return out;
}

function tokVal(s: string, push: Push) {
  const re = /(#[0-9a-fA-F]{3,8}\b)|("[^"]*"|'[^']*')|([\w-]+(?=\())|(-?\d*\.?\d+(?:px|em|rem|%|fr|s|ms|deg|vh|vw)?)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    push(s.slice(last, m.index), 'cval');
    push(m[0], m[1] ? 'num' : m[2] ? 'cval' : m[3] ? 'fn' : 'num');
    last = re.lastIndex;
  }
  push(s.slice(last), 'cval');
}

export function tokCSS(src: string): Token[] {
  const out: Token[] = [];
  const push: Push = (t, c) => { if (t) out.push({ t, c }); };
  const n = src.length;
  let i = 0;
  while (i < n) {
    const ch = src[i]!;
    if (src.startsWith('/*', i)) {
      let e = src.indexOf('*/', i + 2);
      e = e < 0 ? n : e + 2;
      push(src.slice(i, e), 'cmt'); i = e; continue;
    }
    if (/\s/.test(ch)) {
      let j = i;
      while (j < n && /\s/.test(src[j]!)) j++;
      push(src.slice(i, j), 'text'); i = j; continue;
    }
    if ('{};'.includes(ch)) { push(ch, 'punct'); i++; continue; }
    let j = i;
    while (j < n && !';{}'.includes(src[j]!) && !src.startsWith('/*', j)) j++;
    const chunk = src.slice(i, j);
    if (src[j] === '{') {
      const m = chunk[0] === '@' ? /^@[\w-]+/.exec(chunk) : null;
      if (m) { push(m[0], 'kw'); tokVal(chunk.slice(m[0].length), push); }
      else push(chunk, 'sel');
    } else {
      const k = chunk.indexOf(':');
      if (k < 0) push(chunk, 'text');
      else { push(chunk.slice(0, k), 'prop'); push(':', 'text'); tokVal(chunk.slice(k + 1), push); }
    }
    i = j;
  }
  return out;
}

// JavaScript：宣言・値のキーワード（青）と制御構文のキーワード（紫）を色分けする
const JS_STORAGE = new Set([
  'const', 'let', 'var', 'function', 'class', 'new', 'this', 'true', 'false', 'null', 'undefined',
  'typeof', 'instanceof', 'async', 'extends', 'static', 'get', 'set',
]);
const JS_CONTROL = new Set([
  'if', 'else', 'for', 'while', 'do', 'return', 'break', 'continue', 'switch', 'case', 'default',
  'try', 'catch', 'finally', 'throw', 'await', 'of', 'in', 'import', 'export', 'from',
]);

export function tokJS(src: string): Token[] {
  const out: Token[] = [];
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:\\[\s\S]|[^`\\])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)(\s*\()?|(\s+)|([\s\S])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const [, cmt, str, num, ident, call, ws, other] = m;
    if (cmt) out.push({ t: cmt, c: 'cmt' });
    else if (str) out.push({ t: str, c: 'str' });
    else if (num) out.push({ t: num, c: 'num' });
    else if (ident) {
      const c: TokenClass = JS_CONTROL.has(ident) ? 'kw' : JS_STORAGE.has(ident) ? 'stor' : call ? 'fn' : 'var';
      out.push({ t: ident, c });
      if (call) out.push({ t: call, c: 'text' });
    } else out.push({ t: ws || other || '', c: 'text' });
  }
  return out;
}

export type Lang = 'HTML' | 'CSS' | 'JS';
const TOKENIZERS: Record<Lang, (src: string) => Token[]> = { HTML: tokHTML, CSS: tokCSS, JS: tokJS };

/** コードを行ごとのトークン列に変換 */
export function highlight(lang: Lang, code: string): Token[][] {
  const toks = TOKENIZERS[lang](code);
  const lines: Token[][] = [[]];
  for (const tk of toks) {
    tk.t.split('\n').forEach((part, k) => {
      if (k > 0) lines.push([]);
      if (part) lines[lines.length - 1]!.push({ t: part, c: tk.c });
    });
  }
  return lines;
}
