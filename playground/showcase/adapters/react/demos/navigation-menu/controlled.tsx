import { NavigationMenu, type NavMenuItem } from '@magic-scope/react';
import { useState } from 'react';

// 受控:value = 当前打开 panel 的项 value(null 全关),关掉 hoverable 只走点击。
const items: NavMenuItem[] = [
  {
    value: 'learn',
    label: '学习',
    links: [
      { label: '教程', href: '#tutorial' },
      { label: '示例', href: '#examples' },
    ],
  },
  {
    value: 'community',
    label: '社区',
    links: [
      { label: '论坛', href: '#forum' },
      { label: 'Discord', href: '#discord' },
    ],
  },
];

export default function Demo() {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div style={{ display: 'grid', gap: '0.5rem', minBlockSize: '220px' }}>
      <NavigationMenu
        items={items}
        value={open}
        onValueChange={setOpen}
        hoverable={false}
        aria-label="受控导航"
      />
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        当前打开:{open ?? '(全关,点击触发器打开)'}
      </small>
    </div>
  );
}
