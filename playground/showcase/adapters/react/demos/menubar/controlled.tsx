import { Menubar } from '@magic-scope/react';
import { useState } from 'react';

// 受控:value = 当前打开的菜单 value(null 全关),onValueChange 同步;
// onSelect 拿到 (item, menuValue)。
export default function Demo() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [last, setLast] = useState('(无)');

  return (
    <div style={{ display: 'grid', gap: '0.6rem' }}>
      <Menubar
        value={openMenu}
        onValueChange={setOpenMenu}
        onSelect={(item, menuValue) => setLast(`${menuValue} › ${String(item.label)}`)}
      >
        <Menubar.Menu
          value="file"
          label="文件"
          items={[
            { label: '新建', onSelect: () => {} },
            { label: '打开', onSelect: () => {} },
          ]}
        />
        <Menubar.Menu
          value="edit"
          label="编辑"
          items={[
            { label: '复制', onSelect: () => {} },
            { label: '粘贴', onSelect: () => {} },
          ]}
        />
      </Menubar>
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        打开中:{openMenu ?? '(全关)'} · 上次选择:{last}
      </small>
    </div>
  );
}
