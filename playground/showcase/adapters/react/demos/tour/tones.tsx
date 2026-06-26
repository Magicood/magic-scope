import type { TourStep, TourTone } from '@magic-scope/react';
import { Button, Tour } from '@magic-scope/react';
import { type CSSProperties, useRef, useState } from 'react';

const TONES: TourTone[] = ['primary', 'accent', 'success', 'warning', 'danger', 'info', 'neutral'];

// tone 经全库 tone resolver 驱动引导卡高亮 / focus 环 / 发光。选一个色调再开始引导。
export default function Demo() {
  const [tone, setTone] = useState<TourTone>('primary');
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const pick = (sel: string) => () => scopeRef.current?.querySelector(sel) ?? null;

  const steps: TourStep[] = [
    {
      target: pick('[data-tour="badge"]'),
      title: `${tone} 色调`,
      description: '引导卡的主按钮、发光与 focus 环都跟随该 tone 派生。',
    },
    {
      target: pick('[data-tour="cta"]'),
      title: '同一套语义色',
      description: '切换 tone,整轮引导的高亮风格一致变化。',
    },
  ];

  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-4)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ms-space-2)' }}>
        {TONES.map((tk) => (
          <button
            key={tk}
            type="button"
            onClick={() => setTone(tk)}
            style={{ ...chip, ...(tk === tone ? active : null) }}
          >
            {tk}
          </button>
        ))}
      </div>

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
        <span data-tour="badge" style={chip}>
          NEW
        </span>
        <span data-tour="cta" style={chip}>
          升级
        </span>
      </div>

      <div>
        <Button
          tone={tone}
          onClick={() => {
            setCurrent(0);
            setOpen(true);
          }}
        >
          以 {tone} 引导
        </Button>
      </div>

      <Tour
        steps={steps}
        tone={tone}
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

const active: CSSProperties = {
  borderColor: 'var(--ms-color-primary)',
  color: 'var(--ms-color-primary)',
};
