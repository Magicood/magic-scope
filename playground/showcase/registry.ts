import type { DocEntry } from './types';

// —— 分类(顺序即侧栏顺序) ——
export interface Category {
  id: string;
  label: string;
  hint: string;
}

export const CATEGORIES: Category[] = [
  { id: 'actions', label: '操作 Actions', hint: '触发动作' },
  { id: 'forms', label: '表单 Forms', hint: '录入与选择' },
  { id: 'data', label: '数据展示 Data Display', hint: '呈现信息' },
  { id: 'feedback', label: '反馈 Feedback', hint: '状态与通知' },
  { id: 'overlay', label: '浮层 Overlay', hint: '弹层与浮窗' },
  { id: 'navigation', label: '导航 Navigation', hint: '结构与跳转' },
  { id: 'layout', label: '布局 Layout', hint: '容器与分隔' },
];

// 同分类内的展示顺序(未列出的按名称排在其后)。
const ORDER: string[] = [
  'button',
  'input',
  'textarea',
  'label',
  'checkbox',
  'switch',
  'radio',
  'select',
  'slider',
  'number-input',
  'badge',
  'tag',
  'avatar',
  'kbd',
  'table',
  'timeline',
  'alert',
  'progress',
  'spinner',
  'skeleton',
  'toast',
  'dialog',
  'drawer',
  'popover',
  'tooltip',
  'menu',
  'context-menu',
  'alert-dialog',
  'popconfirm',
  'breadcrumb',
  'pagination',
  'tabs',
  'accordion',
  'card',
  'divider',
];

// 自动收录 components/ 下所有条目文件:存在哪些就收哪些(新增文件即自动注册)。
const modules = import.meta.glob<{ entry: DocEntry }>('./components/*.tsx', { eager: true });

const catIndex = (c: string) => {
  const i = CATEGORIES.findIndex((x) => x.id === c);
  return i < 0 ? CATEGORIES.length : i;
};
const orderIndex = (id: string) => {
  const i = ORDER.indexOf(id);
  return i < 0 ? ORDER.length : i;
};

export const ENTRIES: DocEntry[] = Object.values(modules)
  .map((m) => m.entry)
  .filter((e): e is DocEntry => Boolean(e?.id))
  .sort((a, b) => {
    const byCat = catIndex(a.category) - catIndex(b.category);
    if (byCat !== 0) return byCat;
    const byOrder = orderIndex(a.id) - orderIndex(b.id);
    if (byOrder !== 0) return byOrder;
    return a.name.localeCompare(b.name);
  });

export function entriesByCategory(category: string): DocEntry[] {
  return ENTRIES.filter((e) => e.category === category);
}

export function findEntry(id: string): DocEntry | undefined {
  return ENTRIES.find((e) => e.id === id);
}
