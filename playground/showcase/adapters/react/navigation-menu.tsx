import {
  NavigationMenu,
  type NavigationMenuTone,
  type NavigationMenuViewportAlign,
  type NavMenuItem,
} from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

const items: NavMenuItem[] = [
  {
    value: 'products',
    label: '产品',
    links: [
      { label: '组件库', href: '#components', description: '94 个生产级组件' },
      { label: 'Tokens', href: '#tokens', description: '设计变量单一真相源' },
      { label: '动效系统', href: '#motion', description: '进场 / 滚动特效编排' },
    ],
  },
  {
    value: 'resources',
    label: '资源',
    links: [
      { label: '文档', href: '#docs', description: 'VitePress 站点' },
      { label: '展示站', href: '#playground', description: '实时 props 旋钮' },
      { label: '更新日志', href: '#changelog', description: 'Changesets 驱动' },
    ],
  },
  { value: 'pricing', label: '定价', href: '#pricing' },
];

function Playground({ values }: { values: ControlValues }) {
  return (
    <div style={{ minBlockSize: '220px' }}>
      <NavigationMenu
        items={items}
        tone={values.tone as NavigationMenuTone}
        viewportAlign={values.viewportAlign as NavigationMenuViewportAlign}
        hoverable={values.hoverable as boolean}
        viewport={values.viewport as boolean}
        openDelay={values.openDelay as number}
        aria-label="主导航"
      />
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/navigation-menu/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/navigation-menu/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'navigation-menu',
  Playground,
  demos: buildDemos(comps, reactSources),
};
