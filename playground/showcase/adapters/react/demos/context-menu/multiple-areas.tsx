import type { MenuItem } from '@magic-scope/react';
import { ContextMenu } from '@magic-scope/react';
import { useState } from 'react';

// 两块互不干扰的右键区域:children 可包裹任意内容,浮层各自 portal 到 body。
function Area({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <ContextMenu items={items}>
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          blockSize: '7.5rem',
          padding: '1rem',
          borderRadius: 'var(--ms-radius-lg, 0.75rem)',
          border: '1px dashed var(--ms-color-border)',
          background: 'var(--ms-color-surface-muted, rgba(255, 255, 255, 0.03))',
          color: 'var(--ms-color-fg-muted)',
          textAlign: 'center',
          userSelect: 'none',
        }}
      >
        {title}
      </div>
    </ContextMenu>
  );
}

export default function Demo() {
  const [last, setLast] = useState('在任一卡片上右键。');

  const canvasItems: MenuItem[] = [
    { label: '✦ 新建法阵', onSelect: () => setLast('画布:新建法阵') },
    { label: '⌖ 居中视图', onSelect: () => setLast('画布:居中视图') },
  ];
  const runeItems: MenuItem[] = [
    { label: '↻ 重铸', onSelect: () => setLast('符文:重铸') },
    { label: '⧉ 复制', onSelect: () => setLast('符文:复制') },
    { label: '🜂 销毁', danger: true, onSelect: () => setLast('符文:销毁') },
  ];

  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(28rem, 100%)' }}>
      <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1fr 1fr' }}>
        <Area title="画布区域" items={canvasItems} />
        <Area title="符文区域" items={runeItems} />
      </div>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ms-color-fg-muted)' }}>{last}</p>
    </div>
  );
}
