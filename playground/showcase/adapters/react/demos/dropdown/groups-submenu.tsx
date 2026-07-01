import { Button, Dropdown, type DropdownItem } from '@magic-scope/react';

// 分组 + 一层子菜单 + 选中态(checked):group 带标题、submenu 一层展开、
// checked 项按 menuitemcheckbox 渲染并选中后保持打开。
const items: DropdownItem[] = [
  {
    type: 'group',
    label: '视图',
    items: [
      { label: '显示侧栏', checked: true, onSelect: () => {} },
      { label: '显示状态栏', checked: false, onSelect: () => {} },
    ],
  },
  { type: 'separator' },
  {
    label: '导出为',
    submenu: [
      { label: 'PNG', onSelect: () => {} },
      { label: 'SVG', onSelect: () => {} },
      { label: 'PDF', onSelect: () => {} },
    ],
  },
  { label: '前往文档', href: 'https://magic-scope.dev', target: '_blank' },
];

export default function Demo() {
  return <Dropdown trigger={<Button>更多 ▾</Button>} items={items} />;
}
