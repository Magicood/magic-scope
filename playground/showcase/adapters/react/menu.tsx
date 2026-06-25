import type { MenuItem } from '@magic-scope/react';
import { Button, Menu } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const [picked, setPicked] = useState('(尚未选择)');

  const items: MenuItem[] = [
    { label: '重命名 ✎', onSelect: () => setPicked('重命名') },
    { label: '复制链接 ⧉', onSelect: () => setPicked('复制链接') },
  ];
  if (values.withDisabled as boolean) {
    items.push({ label: '归档 ⌂(禁用)', onSelect: () => setPicked('归档'), disabled: true });
  }
  if (values.withDanger as boolean) {
    items.push({ label: '删除 ✕', onSelect: () => setPicked('删除'), danger: true });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <Menu trigger={<Button variant="outline">操作 ▾</Button>} items={items} />
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.875rem' }}>
        上次选择:{picked}
      </p>
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/menu/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/menu/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'menu',
  Playground,
  demos: buildDemos(comps, reactSources),
};
