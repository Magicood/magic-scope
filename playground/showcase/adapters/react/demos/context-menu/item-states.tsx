import type { MenuItem } from '@magic-scope/react';
import { ContextMenu } from '@magic-scope/react';
import { useState } from 'react';

export default function Demo() {
  const [last, setLast] = useState('');

  // 覆盖 MenuItem 的全部能力:普通项 / 禁用项(不可聚焦、不触发)/ 危险项(danger 色)。
  const items: MenuItem[] = [
    { label: '✦ 召唤法阵', onSelect: () => setLast('召唤法阵') },
    { label: '↻ 重铸符文', onSelect: () => setLast('重铸符文') },
    { label: '✕ 封印(已锁定)', disabled: true },
    { label: '🜂 解离结界', danger: true, onSelect: () => setLast('解离结界') },
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
          右键:禁用项不可选,危险项标红
        </div>
      </ContextMenu>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ms-color-fg-muted)' }}>
        {last ? `最近触发:${last}` : '↑↓ / Home / End 在可用项间移动,禁用项会被跳过。'}
      </p>
    </div>
  );
}
