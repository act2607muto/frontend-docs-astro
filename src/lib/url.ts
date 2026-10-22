// サイト内URL（astro.config.mjs の base を反映）
import type { ItemType } from './data';

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');

export const url = {
  top: () => BASE,
  dict: (type: ItemType) => `${BASE}${type}/`,
  learn: () => `${BASE}learn/`,
  cursor: () => `${BASE}cursor/`,
  privacy: () => `${BASE}privacy/`,
  terms: () => `${BASE}terms/`,
  item: (item: { type: ItemType; slug: string }) => `${BASE}${item.type}/${item.slug}/`,
  searchIndex: () => `${BASE}search-index.json`,
  /** Vercel の API（GitHub Pages では存在しない） */
  api: (name: string) => `${BASE}api/${name}`,
};
