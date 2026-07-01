import {
  Menubar,
  type MenubarItem,
  type MenubarMenuPlacement,
  type MenubarTone,
} from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const [picked, setPicked] = useState('(尚未选择)');
  const pick = (label: string) => () => setPicked(label);

  const fileItems: MenubarItem[] = [
    { label: '新建', shortcut: '⌘N', onSelect: pick('文件 › 新建') },
    { label: '打开…', shortcut: '⌘O', onSelect: pick('文件 › 打开') },
    { type: 'separator' },
    { label: '关闭窗口', danger: true, onSelect: pick('文件 › 关闭') },
  ];
  const editItems: MenubarItem[] = [
    { label: '撤销', shortcut: '⌘Z', onSelect: pick('编辑 › 撤销') },
    { label: '重做', shortcut: '⇧⌘Z', disabled: true, onSelect: pick('编辑 › 重做') },
    { type: 'separator' },
    {
      label: '查找',
      submenu: [
        { label: '在文件中查找', onSelect: pick('编辑 › 在文件中查找') },
        { label: '替换', onSelect: pick('编辑 › 替换') },
      ],
    },
  ];
  const viewItems: MenubarItem[] = [
    { label: '显示侧栏', checked: true, onSelect: pick('视图 › 显示侧栏') },
    { label: '全屏', onSelect: pick('视图 › 全屏') },
  ];

  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <Menubar
        tone={values.tone as MenubarTone}
        placement={values.placement as MenubarMenuPlacement}
        closeOnSelect={values.closeOnSelect as boolean}
        disabled={values.disabled as boolean}
      >
        <Menubar.Menu value="file" label="文件" items={fileItems} />
        <Menubar.Menu value="edit" label="编辑" items={editItems} />
        <Menubar.Menu value="view" label="视图" items={viewItems} />
      </Menubar>
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        上次选择:{picked}
      </p>
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/menubar/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/menubar/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'menubar',
  Playground,
  demos: buildDemos(comps, reactSources),
};
