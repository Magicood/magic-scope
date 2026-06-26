import type { TourHandle, TourStep } from '@magic-scope/react';
import { Button, Tour } from '@magic-scope/react';
import { type CSSProperties, useRef, useState } from 'react';

// 命令式句柄:ref 暴露 goTo / next / prev / close,父组件可程序化驱动引导,
// 适合接业务状态机 / 外部按钮跳步。这里用受控 open + 外部按钮直接跳到任意步。
export default function Demo() {
  const [open, setOpen] = useState(false);
  const tourRef = useRef<TourHandle>(null);
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const pick = (sel: string) => () => scopeRef.current?.querySelector(sel) ?? null;

  const steps: TourStep[] = [
    { target: pick('[data-s="0"]'), title: '第一站', description: '由外部句柄驱动,可任意跳。' },
    { target: pick('[data-s="1"]'), title: '第二站', description: 'goTo(1) 直达此步。' },
    { target: pick('[data-s="2"]'), title: '第三站', description: 'next() / prev() 也能用。' },
  ];

  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-4)' }}>
      <div
        ref={scopeRef}
        style={{
          display: 'flex',
          gap: 'var(--ms-space-3)',
          padding: 'var(--ms-space-4)',
          border: '1px solid var(--ms-color-border)',
          borderRadius: 'var(--ms-radius-lg)',
          background: 'var(--ms-color-surface)',
        }}
      >
        {['壹', '贰', '叁'].map((label, i) => (
          <span key={label} data-s={i} style={chip}>
            {label}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ms-space-2)' }}>
        <Button onClick={() => setOpen(true)}>打开</Button>
        <Button variant="ghost" onClick={() => tourRef.current?.goTo(0)}>
          跳到第 1 步
        </Button>
        <Button variant="ghost" onClick={() => tourRef.current?.goTo(2)}>
          跳到第 3 步
        </Button>
        <Button variant="ghost" onClick={() => tourRef.current?.prev()}>
          上一步
        </Button>
        <Button variant="ghost" onClick={() => tourRef.current?.next()}>
          下一步
        </Button>
        <Button variant="ghost" onClick={() => tourRef.current?.close()}>
          关闭
        </Button>
      </div>

      <Tour
        ref={tourRef}
        steps={steps}
        open={open}
        onClose={() => setOpen(false)}
        onFinish={() => setOpen(false)}
      />
    </div>
  );
}

const chip: CSSProperties = {
  padding: 'var(--ms-space-2) var(--ms-space-3)',
  border: '1px solid var(--ms-color-border)',
  borderRadius: 'var(--ms-radius-md)',
  background: 'var(--ms-color-bg)',
  color: 'var(--ms-color-fg)',
  font: 'inherit',
};
