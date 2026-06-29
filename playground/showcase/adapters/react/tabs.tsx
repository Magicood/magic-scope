import type { TabItem, TabsSize, TabsTone } from '@magic-scope/react';
import { Tabs } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

const items: TabItem[] = [
  {
    value: 'overview',
    label: 'Overview 概览',
    content: (
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
        概览汇总进度、成员与关键指标,适合作为默认落地页。下划线变体的选中条带带主色发光。
      </p>
    ),
  },
  {
    value: 'activity',
    label: 'Activity 活动',
    content: (
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
        活动按时间线汇总提交、评论与状态变更。切换标签时面板内容平滑替换。
      </p>
    ),
  },
  {
    value: 'settings',
    label: 'Settings 设置',
    content: (
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
        设置集中权限、通知与集成配置,改动即时保存。键盘 ← → 可在可用标签间循环切换。
      </p>
    ),
  },
  {
    value: 'billing',
    label: 'Billing 计费',
    disabled: true,
    content: <p style={{ margin: 0 }}>当前套餐不可用。</p>,
  },
];

function Playground({ values }: { values: ControlValues }) {
  const [value, setValue] = useState('activity');
  return (
    <div style={{ inlineSize: 'min(32rem, 100%)' }}>
      <Tabs
        items={items}
        value={value}
        onChange={setValue}
        variant={values.variant as 'underline' | 'pill'}
        tone={values.tone as TabsTone}
        size={values.size as TabsSize}
        orientation={values.orientation as 'horizontal' | 'vertical'}
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
