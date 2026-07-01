import { Menubar } from '@magic-scope/react';

// 应用菜单栏最小用法:三个顶级菜单,←→ 在相邻菜单间平移切换。
export default function Demo() {
  return (
    <Menubar>
      <Menubar.Menu
        value="file"
        label="文件"
        items={[
          { label: '新建', shortcut: '⌘N', onSelect: () => {} },
          { label: '打开…', shortcut: '⌘O', onSelect: () => {} },
          { label: '保存', shortcut: '⌘S', onSelect: () => {} },
        ]}
      />
      <Menubar.Menu
        value="edit"
        label="编辑"
        items={[
          { label: '撤销', shortcut: '⌘Z', onSelect: () => {} },
          { label: '重做', shortcut: '⇧⌘Z', onSelect: () => {} },
        ]}
      />
      <Menubar.Menu
        value="help"
        label="帮助"
        items={[{ label: '文档', href: 'https://magic-scope.dev', target: '_blank' }]}
      />
    </Menubar>
  );
}
