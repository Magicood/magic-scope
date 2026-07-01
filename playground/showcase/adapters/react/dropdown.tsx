import {
  Button,
  Dropdown,
  type DropdownItem,
  type DropdownPlacement,
  type DropdownTone,
  type DropdownTriggerAction,
} from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const [picked, setPicked] = useState('(尚未选择)');

  const items: DropdownItem[] = [
    { label: '重命名 ✎', onSelect: () => setPicked('重命名') },
    { label: '复制链接 ⧉', onSelect: () => setPicked('复制链接') },
    { type: 'separator' },
    { label: '归档 ⌂', onSelect: () => setPicked('归档'), disabled: true },
    { label: '删除 ✕', onSelect: () => setPicked('删除'), danger: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <Dropdown
        trigger={<Button variant="outline">操作 ▾</Button>}
        items={items}
        triggerAction={values.triggerAction as DropdownTriggerAction}
        placement={values.placement as DropdownPlacement}
        tone={values.tone as DropdownTone}
        arrow={values.arrow as boolean}
        closeOnSelect={values.closeOnSelect as boolean}
        disabled={values.disabled as boolean}
      />
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        上次选择:{picked}
      </p>
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/dropdown/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/dropdown/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'dropdown',
  Playground,
  demos: buildDemos(comps, reactSources),
};
