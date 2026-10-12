# HTML & CSS GUIDE（Astro版）

HTMLタグ・CSSプロパティの辞典と学習ロードマップのサイトです。
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

## 構成

```
src/
  data/          辞典・ロードマップのデータ（categories / items / details / roadmap）
  config.ts      設定（アコーディオンを1つずつ開く・行番号の表示・初期展開 など）
  lib/           ビルド時の処理（データ整形・URL・シンタックスハイライト・プレビュー文書の生成）
  layouts/       BaseLayout（共通の head・テーマの初期適用）
  components/    Header / Footer / Sidebar / SearchBox / CodeBlock / Preview / DictPage など
  pages/         トップ・辞典一覧・詳細（[type]/[slug].astro で100ページ生成）・ロードマップ・検索用JSON
  scripts/       ブラウザで動く処理（テーマ切替・検索・アコーディオン・コピー・ドロワー・プレビューの高さ調整）
  styles/        tokens.css / base.css / components.css
```

項目を追加するときは `src/data/items.json` と `src/data/details.json` に追記するだけで、詳細ページと検索が自動で更新されます。
