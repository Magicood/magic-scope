import { ScrollArea } from '@magic-scope/react';

// 横向滚动:orientation=horizontal,type=always 常显滚动条,卡片排横向溢出。
const cards = Array.from({ length: 10 }, (_, i) => i + 1);

export default function Demo() {
  return (
    <ScrollArea
      orientation="horizontal"
      type="always"
      style={{
        inlineSize: 'min(400px, 100%)',
        border: '1px solid var(--ms-color-border)',
        borderRadius: 'var(--ms-radius-md)',
      }}
    >
      <div style={{ display: 'flex', gap: '0.75rem', padding: '0.9rem' }}>
        {cards.map((n) => (
          <div
            key={n}
            style={{
              flex: 'none',
              inlineSize: '120px',
              blockSize: '72px',
              display: 'grid',
              placeItems: 'center',
              borderRadius: 'var(--ms-radius-md)',
              background: 'var(--ms-color-bg-subtle)',
              color: 'var(--ms-color-fg-muted)',
            }}
          >
            卡片 {n}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
