import type { ComponentDoc, ComponentMeta, ReactAdapter } from './types';

/**
 * 新架构(meta + 真实 demo + 自动 props)的组件登记 —— 自动发现。
 * 加一个组件 = 丢 registry/<id>.meta.ts + adapters/react/<id>.tsx(+ demos/<id>/*),
 * 无需改本文件。未迁的组件仍走旧 entry(registry.ts),新旧共存、增量迁。
 */
const metaMods = import.meta.glob<{ meta: ComponentMeta }>('../registry/*.meta.ts', {
  eager: true,
});
const adapterMods = import.meta.glob<{ adapter: ReactAdapter }>('../adapters/react/*.tsx', {
  eager: true,
});

const metaById = new Map<string, ComponentMeta>();
for (const m of Object.values(metaMods)) {
  if (m.meta?.id) metaById.set(m.meta.id, m.meta);
}
const adapterById = new Map<string, ReactAdapter>();
for (const a of Object.values(adapterMods)) {
  if (a.adapter?.id) adapterById.set(a.adapter.id, a.adapter);
}

export const V2_DOCS: Record<string, ComponentDoc> = {};
for (const [id, meta] of metaById) {
  const react = adapterById.get(id);
  if (react) V2_DOCS[id] = { meta, react };
}

export function getV2(id: string): ComponentDoc | undefined {
  return V2_DOCS[id];
}

/** 已迁到新架构的 id 集合（供 UI 标注 / 调试）。 */
export const V2_IDS = Object.keys(V2_DOCS);
