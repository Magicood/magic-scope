import { useState } from 'react';
import type { MenuItem } from '../../../packages/react/src/index';
import { Button, Menu } from '../../../packages/react/src/index';
import type { ControlValues, DocEntry } from '../types';

function Demo({ values }: { values: ControlValues }) {
  const [picked, setPicked] = useState('（尚未选择）');

  const items: MenuItem[] = [
    { label: '重命名 ✎', onSelect: () => setPicked('重命名') },
    { label: '复制链接 ⧉', onSelect: () => setPicked('复制链接') },
  ];
  if (values.withDisabled as boolean) {
    items.push({ label: '归档 ⌂（禁用）', onSelect: () => setPicked('归档'), disabled: true });
  }
  if (values.withDanger as boolean) {
    items.push({ label: '删除 ✕', onSelect: () => setPicked('删除'), danger: true });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <Menu trigger={<Button variant="outline">操作 ▾</Button>} items={items} />
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.875rem' }}>
        上次选择：{picked}
      </p>
    </div>
  );
}

export const entry: DocEntry = {
  id: 'menu',
  name: 'Menu',
  category: 'overlay',
  summary: '下拉菜单,Popover API + CSS Anchor Positioning,键盘可达,支持危险项。',
  description:
    '浮层进 top-layer 用 Popover API(popover="auto",自带点外 / Esc light-dismiss),定位用 CSS Anchor Positioning 并以 @supports 降级。\n键盘交互(↑↓ 跳过 disabled / Enter / Space / Home / End / Esc / Tab)自实现;选中后菜单关闭并把焦点交还 trigger。danger 项用 danger 色高亮。',
  controls: [
    { type: 'boolean', prop: 'withDanger', label: '含危险项 danger', default: true },
    { type: 'boolean', prop: 'withDisabled', label: '含禁用项 disabled', default: true },
  ],
  render: (v) => <Demo values={v} />,
  usage: `import { Menu, Button } from '@magic-scope/react';

<Menu
  trigger={<Button variant="outline">操作 ▾</Button>}
  items={[
    { label: '重命名', onSelect: () => {} },
    { label: '删除', onSelect: () => {}, danger: true },
  ]}
/>`,
  props: [
    {
      name: 'trigger',
      type: 'ReactElement',
      default: '—',
      description: '触发元素(通常是 Button)。点击展开菜单;会被注入 anchor-name 与无障碍属性。',
    },
    {
      name: 'items',
      type: 'MenuItem[]',
      default: '—',
      description: '菜单项列表:{ label, onSelect?, disabled?, danger? }。',
    },
    {
      name: 'className',
      type: 'string',
      default: '—',
      description: '外部类名(作用于浮层)。',
    },
    {
      name: 'MenuItem.label',
      type: 'string',
      default: '—',
      description: 'MenuItem:菜单项文本。',
    },
    {
      name: 'MenuItem.onSelect',
      type: '() => void',
      default: '—',
      description: 'MenuItem:选中回调。点击 / Enter 触发后菜单关闭。',
    },
    {
      name: 'MenuItem.disabled',
      type: 'boolean',
      default: 'false',
      description: 'MenuItem:是否禁用(不可聚焦、不触发)。',
    },
    {
      name: 'MenuItem.danger',
      type: 'boolean',
      default: 'false',
      description: 'MenuItem:是否危险项(用 danger 色)。',
    },
  ],
  examples: [
    {
      title: '基础',
      description: '触发元素 + 菜单项,选中后自动关闭。',
      node: (
        <Menu
          trigger={<Button variant="outline">文件 ▾</Button>}
          items={[
            { label: '新建', onSelect: () => {} },
            { label: '打开', onSelect: () => {} },
            { label: '另存为', onSelect: () => {} },
          ]}
        />
      ),
    },
    {
      title: '危险项与禁用项',
      description: 'danger 项高亮,disabled 项不可聚焦也不触发。',
      node: (
        <Menu
          trigger={<Button variant="outline">更多 ▾</Button>}
          items={[
            { label: '编辑', onSelect: () => {} },
            { label: '归档（禁用）', onSelect: () => {}, disabled: true },
            { label: '删除', onSelect: () => {}, danger: true },
          ]}
        />
      ),
    },
  ],
};
