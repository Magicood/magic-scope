import type { MenuItem } from '@magic-scope/react';
import { ContextMenu } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [last, setLast] = useState('');

  const items: MenuItem[] = [
    { label: '✎ 重命名', onSelect: () => setLast('重命名') },
    { label: '⧉ 复制副本', onSelect: () => setLast('复制副本') },
    { label: '⤴ 分享链接', onSelect: () => setLast('分享链接') },
  ];

  return (
    <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'center' }}>
      <ContextMenu items={items}>
        <div
          style={{
            display: 'grid',
            placeItems: 'center',
            inlineSize: 'min(22rem, 100%)',
            blockSize: '9rem',
            padding: '1rem',
            borderRadius: 'var(--ms-radius-lg, 0.75rem)',
            border: '1px dashed var(--ms-color-border)',
            background: 'var(--ms-color-surface-muted, rgba(255, 255, 255, 0.03))',
            color: 'var(--ms-color-fg-muted)',
            textAlign: 'center',
            userSelect: 'none',
          }}
        >
          在此区域右键
        </div>
      </ContextMenu>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ms-color-fg-muted)' }}>
        {last ? `最近触发:${last}` : '右键唤出菜单,点选某项后这里会显示动作。'}
      </p>
    </div>
  );
}
