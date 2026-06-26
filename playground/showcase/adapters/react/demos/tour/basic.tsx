import type { TourStep } from '@magic-scope/react';
import { Button, Tour } from '@magic-scope/react';
import { type CSSProperties, useRef, useState } from 'react';

export default function Demo() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const pick = (sel: string) => () => scopeRef.current?.querySelector(sel) ?? null;

  const steps: TourStep[] = [
    {
      target: pick('[data-tour="new"]'),
      title: '新建组件',
      description: '从这里用生成器起一个新组件,结构与元数据自动就位。',
    },
    {
      target: pick('[data-tour="search"]'),
      title: '搜索',
      description: '全库可搜:组件、token、文档一处直达。',
    },
    {
      target: pick('[data-tour="docs"]'),
      title: '文档',
      description: '示例引真实源码,永不漂移。看完这步即完成引导。',
    },
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
        <button type="button" data-tour="new" style={chip}>
          新建
        </button>
        <button type="button" data-tour="search" style={chip}>
          搜索
        </button>
        <button type="button" data-tour="docs" style={chip}>
          文档
        </button>
      </div>

      <div>
        <Button
          onClick={() => {
            setCurrent(0);
            setOpen(true);
          }}
        >
          开始引导
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

const chip: CSSProperties = {
  padding: 'var(--ms-space-2) var(--ms-space-3)',
  border: '1px solid var(--ms-color-border)',
  borderRadius: 'var(--ms-radius-md)',
  background: 'var(--ms-color-bg)',
  color: 'var(--ms-color-fg)',
  font: 'inherit',
  cursor: 'pointer',
};
