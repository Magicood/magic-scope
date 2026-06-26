import type { TourStep } from '@magic-scope/react';
import { Button, Tour } from '@magic-scope/react';
import { type CSSProperties, useRef, useState } from 'react';

// 整步 content:给某步传 content 即完全替换默认卡(忽略 title/description/底栏),
// 自定义图文、进度、按钮排布皆可。这里第二步用富排版卡 + 自带「我会了」按钮。
export default function Demo() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const pick = (sel: string) => () => scopeRef.current?.querySelector(sel) ?? null;

  const close = () => setOpen(false);

  const steps: TourStep[] = [
    {
      target: pick('[data-tour="spell"]'),
      title: '默认卡',
      description: '这一步用内建标题 / 描述 / 底栏。下一步换成完全自定义内容。',
    },
    {
      target: pick('[data-tour="cast"]'),
      content: (
        <div style={{ display: 'grid', gap: 'var(--ms-space-3)', maxInlineSize: 260 }}>
          <div style={{ fontSize: 28 }}>🪄</div>
          <strong style={{ color: 'var(--ms-color-fg)' }}>这是完全自定义的一步</strong>
          <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.86rem' }}>
            content 给定后,默认的标题 / 底栏都不渲染,排版与操作全交给你。
          </p>
          <Button size="sm" onClick={close}>
            我会了,结束
          </Button>
        </div>
      ),
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
        <button type="button" data-tour="spell" style={chip}>
          选法术
        </button>
        <button type="button" data-tour="cast" style={chip}>
          施放
        </button>
      </div>

      <div>
        <Button
          onClick={() => {
            setCurrent(0);
            setOpen(true);
          }}
        >
          看自定义卡
        </Button>
      </div>

      <Tour
        steps={steps}
        open={open}
        current={current}
        onChange={setCurrent}
        onClose={close}
        onFinish={close}
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
