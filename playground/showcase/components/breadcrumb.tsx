import type { BreadcrumbItem } from '../../../packages/react/src/index';
import { Breadcrumb } from '../../../packages/react/src/index';
import type { DocEntry } from '../types';

/** 完整层级,depth 旋钮按需截取。 */
const TRAIL: BreadcrumbItem[] = [
  { label: '首页', href: '#/' },
  { label: '法术书', href: '#/grimoire' },
  { label: '奥术', href: '#/grimoire/arcane' },
  { label: '传送门', href: '#/grimoire/arcane/portal' },
  { label: '召唤阵' },
];

/** 依据 depth 旋钮裁剪层级,并把末项标为当前页。 */
function buildItems(depth: number): BreadcrumbItem[] {
  const count = Math.min(Math.max(depth, 2), TRAIL.length);
  return TRAIL.slice(0, count).map((item, index) => ({
    ...item,
    // 截取后末项即当前页:去掉 href、标 current。
    href: index === count - 1 ? undefined : item.href,
    current: index === count - 1,
  }));
}

export const entry: DocEntry = {
  id: 'breadcrumb',
  name: 'Breadcrumb',
  category: 'navigation',
  summary: '面包屑导航,语义化 nav/ol 结构,自动把末项识别为当前页。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n结构为 <nav aria-label="breadcrumb"> → <ol> → <li>:非当前项有 href 渲染 <a>(link 色 + hover 微光),当前项渲染 <span aria-current="page">(fg 色、不可点)。\n分隔符为装饰性元素(aria-hidden),屏幕阅读器忽略;末项未显式标 current 时按"末项即当前页"处理。',
  controls: [
    {
      type: 'text',
      prop: 'separator',
      label: '分隔符 separator',
      default: '/',
      placeholder: '如 / › → ·',
    },
    {
      type: 'number',
      prop: 'depth',
      label: '层级数 depth',
      default: 4,
      min: 2,
      max: 5,
      step: 1,
    },
  ],
  render: (v) => (
    <Breadcrumb items={buildItems(v.depth as number)} separator={v.separator as string} />
  ),
  usage: `import { Breadcrumb } from '@magic-scope/react';

<Breadcrumb
  items={[
    { label: '首页', href: '/' },
    { label: '法术书', href: '/grimoire' },
    { label: '召唤阵', current: true },
  ]}
/>`,
  props: [
    {
      name: 'items',
      type: 'BreadcrumbItem[]',
      default: '—',
      description: '面包屑层级项(自前往后):{ label, href?, current? }。',
    },
    {
      name: 'items[].label',
      type: 'ReactNode',
      default: '—',
      description: '项文本,可为任意节点(如带图标)。',
    },
    {
      name: 'items[].href',
      type: 'string',
      default: '—',
      description: '链接地址。提供且非当前项时渲染 <a>;省略则渲染为纯文本。',
    },
    {
      name: 'items[].current',
      type: 'boolean',
      default: '—',
      description:
        '是否为当前页。当前项用 fg 色、不可点,并标 aria-current="page";末项未指定时默认当前页。',
    },
    {
      name: 'separator',
      type: 'ReactNode',
      default: `'/'`,
      description: '项间分隔符,装饰性(aria-hidden)。',
    },
    {
      name: 'className',
      type: 'string',
      default: '—',
      description: '外部类名,作用于根 <nav>。',
    },
  ],
  examples: [
    {
      title: '自定义分隔符',
      description: '分隔符接受任意节点,纯装饰、不参与无障碍语义。',
      node: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Breadcrumb
            separator="›"
            items={[
              { label: '首页', href: '#/' },
              { label: '法术书', href: '#/grimoire' },
              { label: '召唤阵' },
            ]}
          />
          <Breadcrumb
            separator="→"
            items={[
              { label: '首页', href: '#/' },
              { label: '奥术', href: '#/grimoire/arcane' },
              { label: '传送门' },
            ]}
          />
        </div>
      ),
    },
    {
      title: '纯文本项',
      description: '省略 href 的非当前项渲染为静态文本,不可点。',
      node: (
        <Breadcrumb
          items={[
            { label: '首页', href: '#/' },
            { label: '归档' },
            { label: '召唤阵', current: true },
          ]}
        />
      ),
    },
  ],
};
