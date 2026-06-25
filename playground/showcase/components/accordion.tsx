import type { AccordionItem } from '../../../packages/react/src/index';
import { Accordion } from '../../../packages/react/src/index';
import type { ControlValues, DocEntry } from '../types';

const ITEMS: AccordionItem[] = [
  {
    value: 'arcane',
    title: '奥术回路 Arcane',
    content:
      '展开/收起用 grid-template-rows: 0fr → 1fr 过渡,平滑且无需测量高度。展开图标 ▸ 旋转 90°,旋转量乘 motion-scale。',
  },
  {
    value: 'frost',
    title: '霜结协议 Frost',
    content:
      '头部为原生 <button>,带 aria-expanded / aria-controls;内容区 role="region" + aria-labelledby,无障碍开箱即用。',
  },
  {
    value: 'ember',
    title: '余烬通道 Ember',
    content:
      '↑↓ 在头部间移动焦点(跳过 disabled),Home / End 跳首尾;Enter / Space 由原生 button 触发切换。',
  },
  {
    value: 'void',
    title: '虚空封印 Void(禁用)',
    content: '此项被禁用,既不可展开也不会成为键盘焦点的落点。',
    disabled: true,
  },
];

function Demo({ values }: { values: ControlValues }) {
  const type = values.type as 'single' | 'multiple';
  // defaultValue 仅在挂载时生效,切换 type 时用 key 强制重建以体现 single/multiple 差异。
  const defaultValue = type === 'multiple' ? ['arcane', 'frost'] : 'arcane';
  return (
    <Accordion
      key={type}
      type={type}
      items={ITEMS}
      defaultValue={defaultValue}
      className="showcase-accordion"
    />
  );
}

export const entry: DocEntry = {
  id: 'accordion',
  name: 'Accordion',
  category: 'navigation',
  summary: '手风琴折叠面板组,single / multiple 两种展开模式,键盘可达。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n展开/收起用 grid-template-rows: 0fr → 1fr 过渡,无需测量高度;头部为原生 <button>,带完整 aria 关联;↑↓ / Home / End 在头部间移动焦点并跳过 disabled。展开图标旋转量受顶栏「动效」开关控制。',
  controls: [
    {
      type: 'select',
      prop: 'type',
      label: '展开模式 type',
      default: 'single',
      options: [
        { value: 'single', label: 'single 单开' },
        { value: 'multiple', label: 'multiple 多开' },
      ],
    },
  ],
  render: (v) => <Demo values={v} />,
  usage: `import { Accordion } from '@magic-scope/react';

<Accordion
  type="single"
  defaultValue="arcane"
  items={[
    { value: 'arcane', title: '奥术回路', content: '…' },
    { value: 'frost', title: '霜结协议', content: '…' },
  ]}
/>`,
  props: [
    {
      name: 'type',
      type: `'single' | 'multiple'`,
      default: `'single'`,
      description: 'single 同时只展开一项;multiple 可同时展开多项。',
    },
    {
      name: 'items',
      type: 'AccordionItem[]',
      default: '—',
      description: '面板项列表:{ value, title, content, disabled? }。',
    },
    {
      name: 'defaultValue',
      type: 'string | string[]',
      default: '—',
      description: '初始展开值。single 取 string,multiple 取 string[];宽松接受任一形态。',
    },
    {
      name: 'className',
      type: 'string',
      default: '—',
      description: '外部类名(作用于根容器)。',
    },
    {
      name: 'item.value',
      type: 'string',
      default: '—',
      description: 'AccordionItem:唯一标识,用于受控展开判定。',
    },
    {
      name: 'item.title',
      type: 'ReactNode',
      default: '—',
      description: 'AccordionItem:头部标题(button 内容)。',
    },
    {
      name: 'item.content',
      type: 'ReactNode',
      default: '—',
      description: 'AccordionItem:折叠面板内容。',
    },
    {
      name: 'item.disabled',
      type: 'boolean',
      default: 'false',
      description: 'AccordionItem:是否禁用(不可展开、不接收键盘焦点)。',
    },
  ],
  examples: [
    {
      title: '单开 single',
      description: '展开一项时自动收起其余项。',
      node: <Accordion type="single" defaultValue="arcane" items={ITEMS} />,
    },
    {
      title: '多开 multiple',
      description: '各项独立展开,互不影响。',
      node: <Accordion type="multiple" defaultValue={['arcane', 'frost']} items={ITEMS} />,
    },
  ],
};
