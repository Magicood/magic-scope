/**
 * Menu 纯逻辑层 —— 零 React 依赖,可平移进 packages/core。
 *
 * 负责:把「带 group/separator 的树状 items」拍平成「可渲染的扁平行 + 可聚焦索引」、
 * typeahead 类型搜索的命中计算、方向键找下一个可聚焦项。组件壳只管把这些结果接到 DOM/焦点上。
 */

import type { ReactNode } from 'react';

/** 菜单项的语义类型。不填(undefined)= 普通 action 项(向后兼容旧的扁平 MenuItem)。 */
export type MenuItemType = 'item' | 'separator' | 'group';

/** 选中态语义:用于 role=menuitemcheckbox / menuitemradio。 */
export type MenuItemRole = 'checkbox' | 'radio';

/**
 * 单个菜单项。
 *
 * 设计为「单一宽接口 + 可选 type」而非严格判别联合 —— 这样 `item.label / item.disabled /
 * item.danger / item.onSelect` 在任意分支上都可直接访问,保证复用本类型的 ContextMenu 等
 * 既有调用方 100% 向后兼容(它们直接 `items.map` 读这些扁平字段)。
 */
export interface MenuItem {
  /** 语义类型:不填 / 'item' = 普通项;'separator' = 分隔线;'group' = 带标题的分组。 */
  type?: MenuItemType;
  /** 菜单项文本 / 分组标题。放宽为 ReactNode(可塞图标徽标等);separator 不需要。 */
  label?: ReactNode;
  /** 选中回调。点击 / Enter 触发后菜单关闭(除非项为 checkbox/radio 由调用方控制保持开)。 */
  onSelect?: () => void;
  /** 项级原生点击回调(在 onSelect 之前触发,可 preventDefault 阻断后续与关闭)。 */
  onClick?: (event: { defaultPrevented?: boolean; preventDefault: () => void }) => void;
  /** 是否禁用(不可聚焦、不触发)。 */
  disabled?: boolean;
  /** 是否危险项(用 danger 色)。 */
  danger?: boolean;
  /** 前置图标(ReactNode)。 */
  icon?: ReactNode;
  /** 右侧快捷键提示(字符串走 Kbd 解析,或自带 ReactNode)。 */
  shortcut?: string | readonly string[] | ReactNode;
  /** 选中态:配 selectionRole 渲染为 menuitemcheckbox / menuitemradio 并显示对勾。 */
  checked?: boolean;
  /** 选中态语义角色。默认 'checkbox'(当 checked 有定义时)。 */
  selectionRole?: MenuItemRole;
  /** 链接项:有 href 时项渲染为 <a>,点击走原生导航(仍触发 onSelect)。 */
  href?: string;
  /** href 存在时的 target(如 '_blank')。 */
  target?: string;
  /** href 存在时的 rel。 */
  rel?: string;
  /** 'group' 类型的子项。 */
  items?: MenuItem[];
  /** typeahead 用于匹配的纯文本(label 非字符串时由调用方提供,否则取不到可读文本)。 */
  textValue?: string;
}

/** 拍平后的一行,携带在原始(可能嵌套)结构里的可聚焦顺序索引。 */
export interface FlatRow {
  /** 该行的菜单项。 */
  item: MenuItem;
  /** 行类型:item / separator / group-label。 */
  kind: 'item' | 'separator' | 'group-label';
  /** 若 kind==='item',它在「可聚焦序列」里的序号;否则 -1。 */
  focusIndex: number;
  /** 在所有渲染行里的稳定 key 片段。 */
  rowKey: string;
}

/** 拍平结果。 */
export interface FlattenResult {
  /** 全部渲染行(含分组标题与分隔线)。 */
  rows: FlatRow[];
  /** 仅可聚焦的 item(按 focusIndex 顺序),供方向键 / typeahead 用。 */
  focusable: MenuItem[];
}

const isActionItem = (item: MenuItem): boolean => item.type === undefined || item.type === 'item';

/**
 * 把(可含 group / separator 的)items 拍平成渲染行 + 可聚焦序列。
 * group 会先产出一行 group-label,再展开其 items(disabled 项仍渲染但不计入可聚焦序列)。
 */
export function flattenItems(items: MenuItem[]): FlattenResult {
  const rows: FlatRow[] = [];
  const focusable: MenuItem[] = [];
  let focusCursor = 0;

  const pushItem = (item: MenuItem, rowKey: string): void => {
    if (item.disabled) {
      rows.push({ item, kind: 'item', focusIndex: -1, rowKey });
      return;
    }
    rows.push({ item, kind: 'item', focusIndex: focusCursor, rowKey });
    focusable.push(item);
    focusCursor += 1;
  };

  items.forEach((item, i) => {
    if (item.type === 'separator') {
      rows.push({ item, kind: 'separator', focusIndex: -1, rowKey: `sep-${i}` });
      return;
    }
    if (item.type === 'group') {
      rows.push({ item, kind: 'group-label', focusIndex: -1, rowKey: `group-${i}` });
      (item.items ?? []).forEach((sub, j) => {
        if (sub.type === 'separator') {
          rows.push({ item: sub, kind: 'separator', focusIndex: -1, rowKey: `sep-${i}-${j}` });
          return;
        }
        pushItem(sub, `item-${i}-${j}`);
      });
      return;
    }
    if (isActionItem(item)) {
      pushItem(item, `item-${i}`);
    }
  });

  return { rows, focusable };
}

/** 第一个可聚焦项的 focusIndex(无则 -1)。 */
export function firstFocusable(focusable: MenuItem[]): number {
  return focusable.length > 0 ? 0 : -1;
}

/** 最后一个可聚焦项的 focusIndex(无则 -1)。 */
export function lastFocusable(focusable: MenuItem[]): number {
  return focusable.length > 0 ? focusable.length - 1 : -1;
}

/**
 * 从 from 起按 dir 方向找下一个可聚焦索引(可循环到端点停)。
 * focusable 已经只含可聚焦项,所以这里只做边界夹取,不再判 disabled。
 * @param wrap 是否在到达端点时回绕到另一端(typeahead 常需要回绕)。
 */
export function nextFocusIndex(from: number, dir: 1 | -1, total: number, wrap = false): number {
  if (total <= 0) {
    return -1;
  }
  const next = from + dir;
  if (next < 0) {
    return wrap ? total - 1 : 0;
  }
  if (next >= total) {
    return wrap ? 0 : total - 1;
  }
  return next;
}

/** 取一个可聚焦项用于 typeahead 匹配的纯文本(小写、去空白)。 */
export function itemTextValue(item: MenuItem): string {
  if (typeof item.textValue === 'string') {
    return item.textValue.trim().toLowerCase();
  }
  if (typeof item.label === 'string') {
    return item.label.trim().toLowerCase();
  }
  return '';
}

/**
 * typeahead:在可聚焦项里,从 currentIndex 之后(含回绕)找第一个 textValue 以 query 开头的项。
 * - query 为单字符重复(如 'aaa')时退化为「在所有以该字母开头的项之间循环」,匹配原生 select 行为。
 * - 找不到返回 -1。
 */
export function typeaheadMatch(focusable: MenuItem[], query: string, currentIndex: number): number {
  const total = focusable.length;
  if (total === 0 || query.length === 0) {
    return -1;
  }
  const q = query.trim().toLowerCase();
  if (q.length === 0) {
    return -1;
  }

  // 全同一字符:在「以该字母开头」的项之间循环,从当前项的下一个开始。
  const allSame = q.split('').every((c) => c === q[0]);
  const needle = allSame ? (q[0] as string) : q;
  const startOffset = allSame ? 1 : 0;

  for (let step = startOffset; step <= total; step += 1) {
    const idx = (currentIndex + step) % total;
    const item = focusable[idx];
    if (item && itemTextValue(item).startsWith(needle)) {
      return idx;
    }
  }
  return -1;
}
