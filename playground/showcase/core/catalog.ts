import { V2_DOCS } from './registry2';

// —— 分类(顺序即侧栏顺序) ——
export interface Category {
  id: string;
  label: string;
  hint: string;
}

export const CATEGORIES: Category[] = [
  { id: 'actions', label: '操作 Actions', hint: '触发动作' },
  { id: 'typography', label: '文字排版 Typography', hint: '文字与排印' },
  { id: 'layout', label: '布局 Layout', hint: '容器与分隔' },
  { id: 'forms', label: '表单 Forms', hint: '录入与选择' },
  { id: 'data', label: '数据展示 Data Display', hint: '呈现信息' },
  { id: 'feedback', label: '反馈 Feedback', hint: '状态与通知' },
  { id: 'navigation', label: '导航 Navigation', hint: '结构与跳转' },
  { id: 'overlay', label: '浮层 Overlay', hint: '弹层与浮窗' },
  { id: 'composite', label: '复合 Composite', hint: '组合基础件、自成体系' },
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

export interface CatalogItem {
  id: string;
  name: string;
  category: string;
  summary: string;
}

const catIndex = (c: string) => {
  const i = CATEGORIES.findIndex((x) => x.id === c);
  return i < 0 ? CATEGORIES.length : i;
};
const orderIndex = (id: string) => {
  const i = ORDER.indexOf(id);
  return i < 0 ? ORDER.length : i;
};

// 唯一组件目录:从 v2 文档(meta + adapter)推出,按分类 → 顺序 → 名称排序。
export const CATALOG: CatalogItem[] = Object.values(V2_DOCS)
  .map((d) => ({
    id: d.meta.id,
    name: d.meta.name,
    category: d.meta.category,
    summary: d.meta.summary,
  }))
  .sort((a, b) => {
    const byCat = catIndex(a.category) - catIndex(b.category);
    if (byCat !== 0) return byCat;
    const byOrder = orderIndex(a.id) - orderIndex(b.id);
    if (byOrder !== 0) return byOrder;
    return a.name.localeCompare(b.name);
  });

export function findCatalog(id: string): CatalogItem | undefined {
  return CATALOG.find((c) => c.id === id);
}

export function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? '';
}
