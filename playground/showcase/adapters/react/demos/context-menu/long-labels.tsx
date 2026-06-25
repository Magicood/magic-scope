import type { MenuItem } from '@magic-scope/react';
import { ContextMenu } from '@magic-scope/react';
import { useState } from 'react';

// 对抗性内容:超长无空格串 + 巨量菜单项。
// 菜单项 white-space: normal + overflow-wrap: anywhere → 长串换行收在 max-inline-size(20rem)内;
// 菜单 max-block-size + overflow-y: auto → 项太多时内部滚动,浮层不撑破视口、焦点环不被裁。
export default function Demo() {
  const [last, setLast] = useState('右键看长文案与超多项如何被收住。');

  const items: MenuItem[] = [
    {
      label:
        '召唤一道贯穿九重奥术回廊的超长无空格符文链路WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
      onSelect: () => setLast('已触发:超长无空格符文链路(已换行收住)'),
    },
    {
      label:
        '这是一条没有任何标点也不会断开的连续中文文案用来检验多行正文能否在菜单宽度内自然换行收拢不溢出',
      onSelect: () => setLast('已触发:超长中文连续文案(已换行收住)'),
    },
    ...Array.from({ length: 16 }, (_, i) => ({
      label: `符文条目 #${String(i + 1).padStart(2, '0')} · 用以撑出纵向滚动`,
      onSelect: () => setLast(`已触发:符文条目 #${String(i + 1).padStart(2, '0')}`),
    })),
    { label: '🜂 解离整条链路', danger: true, onSelect: () => setLast('已触发:解离整条链路') },
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
          右键:超长文案 + 超多项(看换行与滚动)
        </div>
      </ContextMenu>
      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ms-color-fg-muted)' }}>{last}</p>
    </div>
  );
}
