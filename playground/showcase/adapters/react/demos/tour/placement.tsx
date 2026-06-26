import type { TourStep } from '@magic-scope/react';
import { Button, Tour } from '@magic-scope/react';
import { type CSSProperties, useRef, useState } from 'react';

// 引导卡方位:省略 placement 时按目标在视口的剩余空间自动推断;
// 也可在每步显式指定 top / bottom / left / right。这里四角各放一个目标、显式四向。
export default function Demo() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const pick = (sel: string) => () => scopeRef.current?.querySelector(sel) ?? null;

  const steps: TourStep[] = [
    {
      target: pick('[data-c="tl"]'),
      placement: 'bottom',
      title: '弹向下方',
      description: 'placement="bottom"',
    },
    {
      target: pick('[data-c="tr"]'),
      placement: 'left',
      title: '弹向左侧',
      description: 'placement="left"',
    },
    {
      target: pick('[data-c="br"]'),
      placement: 'top',
      title: '弹向上方',
      description: 'placement="top"',
    },
    {
      target: pick('[data-c="bl"]'),
      placement: 'right',
      title: '弹向右侧',
      description: 'placement="right"',
    },
  ];

  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-4)' }}>
      <div
        ref={scopeRef}
        style={{
          position: 'relative',
          blockSize: 220,
          border: '1px solid var(--ms-color-border)',
          borderRadius: 'var(--ms-radius-lg)',
          background: 'var(--ms-color-surface)',
        }}
      >
        <button
          type="button"
          data-c="tl"
          style={{ ...dot, insetBlockStart: 12, insetInlineStart: 12 }}
        >
          ◤
        </button>
        <button
          type="button"
          data-c="tr"
          style={{ ...dot, insetBlockStart: 12, insetInlineEnd: 12 }}
        >
          ◥
        </button>
        <button
          type="button"
          data-c="bl"
          style={{ ...dot, insetBlockEnd: 12, insetInlineStart: 12 }}
        >
          ◣
        </button>
        <button type="button" data-c="br" style={{ ...dot, insetBlockEnd: 12, insetInlineEnd: 12 }}>
          ◢
        </button>
      </div>

      <div>
        <Button
          onClick={() => {
            setCurrent(0);
            setOpen(true);
          }}
        >
          四向逐步看
        </Button>
      </div>

      <Tour
        steps={steps}
        open={open}
        current={current}
        onChange={setCurrent}
        onClose={() => setOpen(false)}
        onFinish={() => setOpen(false)}
      />
    </div>
  );
}

const dot: CSSProperties = {
  position: 'absolute',
  inlineSize: 40,
  blockSize: 40,
  display: 'grid',
  placeItems: 'center',
  border: '1px solid var(--ms-color-border)',
  borderRadius: 'var(--ms-radius-md)',
  background: 'var(--ms-color-bg)',
  color: 'var(--ms-color-fg)',
  font: 'inherit',
  cursor: 'pointer',
};
