import type { DrawerSide } from '@magic-scope/react';
import { Button, Drawer } from '@magic-scope/react';
import { useState } from 'react';

const sides: { value: DrawerSide; label: string }[] = [
  { value: 'start', label: '左 start' },
  { value: 'end', label: '右 end' },
  { value: 'top', label: '上 top' },
  { value: 'bottom', label: '下 bottom' },
];

export default function Demo() {
  const [side, setSide] = useState<DrawerSide | null>(null);
  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {sides.map((s) => (
          <Button key={s.value} variant="outline" onClick={() => setSide(s.value)}>
            {s.label}
          </Button>
        ))}
      </div>
      <Drawer
        open={side != null}
        onClose={() => setSide(null)}
        side={side ?? 'end'}
        title={`从 ${side ?? 'end'} 滑入`}
      >
        <p style={{ marginBlockStart: 0, color: 'var(--ms-color-fg-muted)' }}>
          side 控制滑入边:start / end 为竖向侧边栏,top / bottom 为横向贴边面板。
        </p>
        <Button onClick={() => setSide(null)}>收起</Button>
      </Drawer>
    </>
  );
}
