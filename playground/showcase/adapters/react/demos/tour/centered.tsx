import type { TourStep } from '@magic-scope/react';
import { Button, Tour } from '@magic-scope/react';
import { type CSSProperties, useRef, useState } from 'react';

// 无目标的步:省略 target,该步引导卡居中(placement 自动归为 'center'),
// 适合做开场欢迎 / 收尾致谢。这里首尾居中、中间一步有高亮目标。
export default function Demo() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const pick = (sel: string) => () => scopeRef.current?.querySelector(sel) ?? null;

  const steps: TourStep[] = [
    {
      title: '欢迎来到 magic-scope',
      description: '这一步没有高亮目标,引导卡居中作为开场白。',
    },
    {
      target: pick('[data-tour="core"]'),
      title: '可变内核',
      description: '点这里切换驱动核心,配色与动效随之而变。',
    },
    {
      title: '准备就绪',
      description: '收尾也用一张居中卡致谢,引导到此结束。',
    },
  ];

  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-4)' }}>
      <div
        ref={scopeRef}
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: 'var(--ms-space-5)',
          border: '1px solid var(--ms-color-border)',
          borderRadius: 'var(--ms-radius-lg)',
          background: 'var(--ms-color-surface)',
        }}
      >
        <button type="button" data-tour="core" style={core}>
          ✦ 内核
        </button>
      </div>

      <div>
        <Button
          onClick={() => {
            setCurrent(0);
            setOpen(true);
          }}
        >
          开场 → 高亮 → 收尾
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

const core: CSSProperties = {
  padding: 'var(--ms-space-3) var(--ms-space-5)',
  border: '1px solid var(--ms-color-border)',
  borderRadius: 'var(--ms-radius-md)',
  background: 'var(--ms-color-bg)',
  color: 'var(--ms-color-fg)',
  font: 'inherit',
  cursor: 'pointer',
};
