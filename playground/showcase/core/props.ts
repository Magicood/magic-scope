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
    // 必填与否是对「所属组件」的断言:并进父表后就不成立了(Menu 甚至不接受 children,
    // 却会因为并入 Menu.Trigger 而显示 `children *`)。来源已写在说明里,这里只清掉必填标记。
    merged.push(...(DB[a] ?? []).map((r) => (r.required ? { ...r, required: false } : r)));
  }
  // 多接口合并会有重名(如 ConfirmOptions/PromptOptions 都有 title),按名去重保留首个。
  // 例外:原生透传行(native)不得顶掉子部件自己的同名 prop —— 原生行两张表都不渲染
  // (props 表滤掉事件、事件表滤掉 native),留着它等于让真有文档的那行凭空消失
  // (Form.Reset 的 onClick、Collapsible.Trigger 的 onClick / onKeyDown 都曾如此)。
  // 与 scripts/generate-docs.ts 的 getRows 同口径,改一处必须同步另一处。
  const at = new Map<string, number>();
  const rows: PropRow[] = [];
  for (const r of merged) {
    const i = at.get(r.name);
    if (i === undefined) {
      at.set(r.name, rows.length);
      rows.push(r);
    } else if (rows[i]?.native && !r.native) {
      rows[i] = r;
    }
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
