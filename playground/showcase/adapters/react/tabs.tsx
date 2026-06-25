import type { TabItem } from '@magic-scope/react';
import { Tabs } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

const items: TabItem[] = [
  {
    value: 'arcane',
    label: 'Arcane 奥术',
    content: (
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
        奥术系主打瞬发与爆发,适合需要高频施法的场景。下划线变体的选中条带带主色发光。
      </p>
    ),
  },
  {
    value: 'frost',
    label: 'Frost 冰霜',
    content: (
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
        冰霜系以控场见长,减速与冻结让节奏尽在掌握。切换标签时面板内容平滑替换。
      </p>
    ),
  },
  {
    value: 'ember',
    label: 'Ember 余烬',
    content: (
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
        余烬系持续灼烧,以时间换取可观的总伤害。键盘 ← → 可在可用标签间循环切换。
      </p>
    ),
  },
  {
    value: 'void',
    label: 'Void 虚空',
    disabled: true,
    content: <p style={{ margin: 0 }}>虚空系尚未解锁。</p>,
  },
];

function Playground({ values }: { values: ControlValues }) {
  const [value, setValue] = useState('frost');
  return (
    <div style={{ inlineSize: 'min(32rem, 100%)' }}>
      <Tabs
        items={items}
        value={value}
        onChange={setValue}
        variant={values.variant as 'underline' | 'pill'}
      />
    </div>
  );
}

// 真实 demo 文件：同一文件既 import 渲染、又 ?raw 取源码（永不漂移）。
const comps = import.meta.glob<{ default: ComponentType }>('./demos/tabs/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/tabs/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'tabs',
  Playground,
  demos: buildDemos(comps, reactSources),
};
