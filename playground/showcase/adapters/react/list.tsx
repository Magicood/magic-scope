import type { ListMarkerType, ListSpacing, ListTone, ListVariant } from '@magic-scope/react';
import { List } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const variant = values.variant as ListVariant;
  const common = {
    variant,
    marker: values.marker as ListMarkerType,
    spacing: values.spacing as ListSpacing,
    tone: values.tone as ListTone,
    markerPosition: values.markerPosition as 'inside' | 'outside',
    glow: values.glow as boolean,
    style: { inlineSize: 'min(360px, 100%)' },
  };

  if (variant === 'description') {
    return (
      <List {...common}>
        <List.Term>奥术飞弹</List.Term>
        <List.Detail>无需命中检定,自动击中目标的塑能法术。</List.Detail>
        <List.Term>传送门</List.Term>
        <List.Detail>在两点之间撕开一道稳定的空间裂隙。</List.Detail>
      </List>
    );
  }

  return (
    <List {...common}>
      <List.Item>研习一道塑能法术</List.Item>
      <List.Item>积蓄法力直至临界</List.Item>
      <List.Item>引导奥术能量成形</List.Item>
    </List>
  );
}

// 真实 demo 文件:同一文件既 import 渲染、又 ?raw 取源码(永不漂移)。
const comps = import.meta.glob<{ default: ComponentType }>('./demos/list/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/list/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'list',
  Playground,
  demos: buildDemos(comps, reactSources),
};
