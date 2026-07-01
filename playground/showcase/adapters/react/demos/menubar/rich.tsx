import { Menubar, type MenubarItem } from '@magic-scope/react';

// 富项:分组标题、分隔线、选中态(checked → menuitemcheckbox)、危险项、一层子菜单。
const viewItems: MenubarItem[] = [
  { type: 'group', label: '外观' },
  { label: '浅色', checked: false, selectionRole: 'radio', onSelect: () => {} },
  { label: '深色', checked: true, selectionRole: 'radio', onSelect: () => {} },
  { type: 'separator' },
  { label: '显示状态栏', checked: true, onSelect: () => {} },
  {
    label: '编辑器布局',
    submenu: [
      { label: '单栏', onSelect: () => {} },
      { label: '双栏', onSelect: () => {} },
    ],
  },
];

export default function Demo() {
  return (
    <Menubar tone="accent">
      <Menubar.Menu
        value="file"
        label="文件"
        items={[
          { label: '新建', icon: '＋', onSelect: () => {} },
          { type: 'separator' },
          { label: '移到废纸篓', danger: true, onSelect: () => {} },
        ]}
      />
      <Menubar.Menu value="view" label="视图" items={viewItems} />
      <Menubar.Menu value="disabled" label="工具" disabled items={[]} />
    </Menubar>
  );
}
