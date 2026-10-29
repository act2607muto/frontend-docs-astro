// サイト全体の設定値
export const CONFIG = {
  /** アコーディオンを1つずつ開く（true にすると他のカテゴリが閉じる） */
  accordionSingle: false,
  /** コードブロックに行番号を表示する */
  lineNumbers: true,
  /** 検索ドロップダウンの最大件数 */
  searchLimit: 8,
  /** 辞典一覧で初期展開するカテゴリ（例：{ html: ['text'], css: ['flexgrid'] }） */
  dictInitialOpen: { html: [] as string[], css: [] as string[], js: [] as string[] },
  /** トップページの「よく調べるキーワード」（検索履歴が取得できないとき・足りないときに使う既定の語句） */
  quickWords: ['flex', 'margin', '中央寄せ', '画像', '見出し', 'grid', 'position', 'ボタン', 'フォーム', 'リンク'],
};
