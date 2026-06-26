import type { ComponentType } from 'react';
import type { DemoEntry } from './types';

/**
 * 把 import.meta.glob 收集到的 demo 组件 + ?raw 源码配对成 DemoEntry[]。
 * 每个 adapter 用各自的字面量 glob 路径取两份(Vite 要求字面量),再丢进这里。
 * 当前只填 react 源码;将来 vue/angular adapter 注入对应 sources 即可多一个可切换标签。
 */
export function buildDemos(
  comps: Record<string, { default: ComponentType }>,
  reactSources: Record<string, string>,
): DemoEntry[] {
  return Object.keys(comps)
    .sort()
    .map((path) => ({
      name: path.split('/').pop()?.replace('.tsx', '') ?? path,
      Comp: comps[path].default,
      sources: { react: reactSources[path] },
    }));
}
