// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages（https://act2607muto.github.io/frontend-docs-astro/）で公開する設定
export default defineConfig({
  site: 'https://act2607muto.github.io',
  base: '/frontend-docs-astro',
  trailingSlash: 'always',
});
