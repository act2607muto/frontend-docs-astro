# FRONTEND-DOCS（Astro版）

HTMLタグ・CSSプロパティ・JavaScriptの辞典と学習ロードマップのサイトです。
素の HTML・CSS・JS で作った [frontend-docs](https://github.com/act2607muto/frontend-docs) を、[Astro](https://astro.build/) で作り直したものです。見た目と動きは同じで、ページの本文をビルド時に HTML として書き出します。

公開URL：https://act2607muto.github.io/frontend-docs-astro/

## 使い方

```sh
npm install
npm run dev      # 開発サーバー（http://localhost:4321/frontend-docs-astro/）
npm run build    # dist/ に書き出し
npm run preview  # 書き出した dist/ を確認
npm run check    # 型チェック
```

`main` に push（マージ）すると、GitHub Actions（`.github/workflows/deploy.yml`）がビルドして GitHub Pages に公開します。

## Vercel ＋ Supabase で公開する場合

Vercel で公開すると、`api/` の API が動き、検索履歴を Supabase に保存してトップの「よく調べるキーワード」に反映します。
Vercel のビルドでは URL の起点が `/` に、GitHub Pages では `/frontend-docs-astro/` になります（`astro.config.mjs`）。
API がない環境（GitHub Pages・`npm run dev`）では、`src/config.ts` の既定の語句を表示します。

1. **Supabase**：プロジェクトを作成し、SQL Editor で [`supabase/schema.sql`](supabase/schema.sql) を実行する（静的版と同じプロジェクトを使うと、両方のサイトの検索履歴がまとめて集計されます）
2. **Vercel**：このリポジトリをインポートし、Environment Variables に次の2つを登録してデプロイする
   - `SUPABASE_URL` … Supabase の Project URL
   - `SUPABASE_SERVICE_ROLE_KEY` … Supabase の `service_role` キー（ブラウザには出さない秘密の鍵）

| API | 内容 |
|---|---|
| `POST /api/search-log` | 検索結果から項目を開いたときの検索語を記録（辞典にヒットする語句だけ） |
| `GET /api/popular-keywords?limit=5` | 直近30日でよく検索された語句（5分間キャッシュ） |

## 構成

```
src/
  data/          辞典・ロードマップのデータ（categories / items / details / roadmap）
  config.ts      設定（アコーディオンを1つずつ開く・行番号の表示・初期展開 など）
  lib/           ビルド時の処理（データ整形・URL・シンタックスハイライト・プレビュー文書の生成）
  layouts/       BaseLayout（共通の head・テーマの初期適用）
  components/    Header / Footer / Sidebar / SearchBox / SearchDialog（Ctrl / ⌘ + K）/ CodeBlock / Preview / DictPage など
  pages/         トップ・辞典一覧・詳細（[type]/[slug].astro で144ページ生成）・ロードマップ・検索用JSON
  scripts/       ブラウザで動く処理（テーマ切替・検索と検索履歴の送信・アコーディオン・コピー・ドロワー・プレビューの高さ調整と JS のコンソール出力）
  styles/        tokens.css / base.css / components.css
api/             Vercel の API（検索履歴の記録・人気の語句）
supabase/        データベースの定義（schema.sql）
```

項目を追加するときは `src/data/items.json` と `src/data/details.json` に追記するだけで、詳細ページと検索が自動で更新されます。
