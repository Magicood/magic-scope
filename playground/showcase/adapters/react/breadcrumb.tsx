import type { BreadcrumbItem } from '@magic-scope/react';
import { Breadcrumb } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

/** 完整层级,depth 旋钮按需截取。 */
const TRAIL: BreadcrumbItem[] = [
  { label: '首页', href: '#/' },
  { label: '项目', href: '#/projects' },
  { label: 'Atlas 平台', href: '#/projects/atlas' },
  { label: '设置', href: '#/projects/atlas/settings' },
  { label: '成员' },
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

function Playground({ values }: { values: ControlValues }) {
  return (
    <Breadcrumb items={buildItems(values.depth as number)} separator={values.separator as string} />
  );
}

// 真实 demo 文件:同一文件既 import 渲染、又 ?raw 取源码(永不漂移)。
const comps = import.meta.glob<{ default: ComponentType }>('./demos/breadcrumb/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/breadcrumb/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'breadcrumb',
  Playground,
  demos: buildDemos(comps, reactSources),
};
