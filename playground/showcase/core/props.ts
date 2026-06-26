import generated from '../generated/props.json';
import type { PropRow } from './types';

const DB = generated as Record<string, PropRow[]>;

/**
 * 取某组件的 props 表(来自真实 TS 抽取,见 scripts/extract-props.ts)。
 * also：并入其它 displayName 的 props（多导出，如 Radio 并 RadioGroup）。
 * spread：追加一行「…props」表示透传原生元素属性。
 */
export function getProps(name: string, also: string[] = [], spread?: string): PropRow[] {
  const merged: PropRow[] = [...(DB[name] ?? [])];
  for (const a of also) {
    merged.push(...(DB[a] ?? []));
  }
  // 多接口合并会有重名(如 ConfirmOptions/PromptOptions 都有 title),按名去重保留首个。
  const seen = new Set<string>();
  const rows: PropRow[] = [];
  for (const r of merged) {
    if (seen.has(r.name)) continue;
    seen.add(r.name);
    rows.push(r);
  }
  if (spread) {
    rows.push({
      name: '...props',
      type: `ComponentPropsWithoutRef<'${spread}'>`,
      default: '—',
      description: `透传原生 ${spread} 属性（className / style / aria-* / 事件等）。`,
      required: false,
    });
  }
  return rows;
}
