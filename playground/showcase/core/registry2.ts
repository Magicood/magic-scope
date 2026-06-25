import { adapter as buttonAdapter } from '../adapters/react/button';
import { meta as buttonMeta } from '../registry/button.meta';
import type { ComponentDoc } from './types';

/**
 * 新架构(meta + 真实 demo + 自动 props)的组件登记。
 * 增量迁移:迁到新架构的组件登记在这里,其余仍走旧 entry(registry.ts)。
 */
export const V2_DOCS: Record<string, ComponentDoc> = {
  button: { meta: buttonMeta, react: buttonAdapter },
};

export function getV2(id: string): ComponentDoc | undefined {
  return V2_DOCS[id];
}
