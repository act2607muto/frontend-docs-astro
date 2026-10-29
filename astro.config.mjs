// @ts-check
import { defineConfig } from 'astro/config';

// 公開先によって URL の起点を切り替える
// - GitHub Pages：https://act2607muto.github.io/frontend-docs-astro/（GitHub Actions でビルド）
// - Vercel：https://frontend-docs.dev/（Vercel のビルドでは環境変数 VERCEL=1 が入る。本番ドメインは VERCEL_PROJECT_PRODUCTION_URL で受け取る）
const onVercel = !!process.env.VERCEL;

export default defineConfig({
  site: onVercel ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || 'localhost'}` : 'https://act2607muto.github.io',
  base: onVercel ? '/' : '/frontend-docs-astro',
  trailingSlash: 'always',
});
