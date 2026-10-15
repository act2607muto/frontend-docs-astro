// data/*.json を読み込み、描画しやすい形に整える（ビルド時のみ実行）
import categoriesJson from '../data/categories.json';
import itemsJson from '../data/items.json';
import detailsJson from '../data/details.json';
import roadmapJson from '../data/roadmap.json';

export type ItemType = 'html' | 'css' | 'js';
/** 辞典の種類（表示順） */
export const TYPES: ItemType[] = ['html', 'css', 'js'];

/** 種類ごとの表示名 */
export const TYPE_INFO: Record<ItemType, { dict: string; tag: string; kicker: string; unit: string }> = {
  html: { dict: 'HTML辞典', tag: 'HTML', kicker: 'HTML要素', unit: 'タグ' },
  css: { dict: 'CSS辞典', tag: 'CSS', kicker: 'CSS', unit: 'プロパティ' },
  js: { dict: 'JS辞典', tag: 'JS', kicker: 'JavaScript', unit: '構文・メソッド' },
};

/** サイト名 */
export const SITE = 'FRONTEND-DOCS';

export interface Item {
  id: string;
  type: ItemType;
  slug: string;
  name: string;
  summary: string;
  keywords: string[];
  category: string;
  categoryName: string;
  hasDetail: boolean;
}

export interface CodeSet {
  html?: string | null;
  css?: string | null;
  js?: string | null;
}

export interface Detail {
  id: string;
  title: string | null;
  ja: string;
  lead: string;
  meta: { label: string; value: string }[];
  code: CodeSet;
  preview: { height: number; note: string | null; fullDocument: boolean };
  explain: string[];
  values: { label: string; head: string; rows: { key: string; desc: string }[] };
  usages: ({ title: string; desc: string } & CodeSet)[];
  notes: string[];
  related: string[];
}

export interface Category {
  id: string;
  name: string;
  items: Item[];
}

export interface Stage {
  num: string;
  name: string;
  en: string;
  desc: string;
  steps: { title: string; desc: string; links: string[] }[];
}

const details: Record<string, Detail> = Object.fromEntries(
  (detailsJson as Detail[]).map((d) => [d.id, d]),
);

const catName = new Map<string, string>();
const categoryList = categoriesJson as Record<ItemType, { id: string; name: string }[]>;
for (const type of TYPES) for (const c of categoryList[type]) catName.set(`${type}:${c.id}`, c.name);

export const items: Item[] = (itemsJson as Omit<Item, 'categoryName' | 'hasDetail'>[]).map((it) => ({
  ...it,
  categoryName: catName.get(`${it.type}:${it.category}`) ?? '',
  hasDetail: !!details[it.id],
}));

export const index: Record<string, Item> = Object.fromEntries(items.map((it) => [it.id, it]));

export const cats = Object.fromEntries(
  TYPES.map((type) => [
    type,
    categoryList[type].map((c) => ({
      ...c,
      items: items.filter((it) => it.type === type && it.category === c.id),
    })),
  ]),
) as Record<ItemType, Category[]>;

/** 種類ごとの並び順（カテゴリ順 → カテゴリ内の順） */
export const order = Object.fromEntries(
  TYPES.map((type) => [type, cats[type].flatMap((c) => c.items.map((it) => it.id))]),
) as Record<ItemType, string[]>;

export const roadmap = roadmapJson as Stage[];

export const getDetail = (id: string): Detail | undefined => details[id];

/** 表示用ラベル（HTMLタグは <name> 表記） */
export const titleOf = (item: Item) => (item.type === 'html' ? `<${item.name}>` : item.name);

/** 関連項目：解説があればその related、なければ同カテゴリの他項目（最大4件） */
export function relatedOf(item: Item): Item[] {
  const d = details[item.id];
  const ids = d
    ? d.related
    : order[item.type].filter((id) => id !== item.id && index[id]!.category === item.category).slice(0, 4);
  return ids.map((id) => index[id]).filter((x): x is Item => !!x);
}

export const countLabel = () => `${TYPES.map((t) => `${TYPE_INFO[t].tag} ${order[t].length}項目`).join(' ・ ')}を収録`;

/** `バッククォート` 部分を分割（奇数番目がコード） */
export const segments = (text: string) =>
  text
    .split(/`([^`]+)`/)
    .map((t, i) => ({ t, code: i % 2 === 1 }))
    .filter((s) => s.t);

export const pad2 = (n: number) => String(n).padStart(2, '0');
