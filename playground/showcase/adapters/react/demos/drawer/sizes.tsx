import type { DrawerSize } from '@magic-scope/react';
import { Button, Drawer } from '@magic-scope/react';
import { useState } from 'react';

// size 档位:start / end 时控面板宽度,top / bottom 时控面板高度。
const SIZES: { value: DrawerSize; label: string }[] = [
  { value: 'sm', label: 'sm 紧凑' },
  { value: 'md', label: 'md 默认' },
  { value: 'lg', label: 'lg 宽阔' },
];

export default function Demo() {
  const [size, setSize] = useState<DrawerSize | null>(null);
  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {SIZES.map((s) => (
          <Button key={s.value} variant="outline" onClick={() => setSize(s.value)}>
            {s.label}
          </Button>
        ))}
      </div>
      <Drawer
        open={size != null}
        onClose={() => setSize(null)}
        size={size ?? 'md'}
        title={`size = ${size ?? 'md'}`}
      >
        <p style={{ marginBlockStart: 0, color: 'var(--ms-color-fg-muted)' }}>
          size 控制面板尺寸:start / end 抽屉变宽度,top / bottom 抽屉变高度;正文与底栏随之适配。
        </p>
        <Button onClick={() => setSize(null)}>收起</Button>
      </Drawer>
    </>
  );
}
