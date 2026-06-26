import type { AccordionItem } from '@magic-scope/react';
import { Accordion } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

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

function Playground({ values }: { values: ControlValues }) {
  const type = values.type as 'single' | 'multiple';
  // defaultValue 仅在挂载时生效,切换 type 时用 key 强制重建以体现 single/multiple 差异。
  const defaultValue = type === 'multiple' ? ['arcane', 'frost'] : 'arcane';
  return <Accordion key={type} type={type} items={ITEMS} defaultValue={defaultValue} />;
}

// 真实 demo 文件：同一文件既 import 渲染、又 ?raw 取源码（永不漂移）。
const comps = import.meta.glob<{ default: ComponentType }>('./demos/accordion/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/accordion/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'accordion',
  Playground,
  demos: buildDemos(comps, reactSources),
};
