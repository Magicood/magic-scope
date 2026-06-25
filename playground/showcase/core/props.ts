import generated from '../generated/props.json';
import type { PropRow } from './types';

const DB = generated as Record<string, PropRow[]>;

/**
 * 取某组件的 props 表(来自真实 TS 抽取,见 scripts/extract-props.ts)。
 * also：并入其它 displayName 的 props（多导出，如 Radio 并 RadioGroup）。
 * spread：追加一行「…props」表示透传原生元素属性。
 */
export function getProps(name: string, also: string[] = [], spread?: string): PropRow[] {
  const rows: PropRow[] = [...(DB[name] ?? [])];
  for (const a of also) {
    rows.push(...(DB[a] ?? []));
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
