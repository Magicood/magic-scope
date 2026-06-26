import type { TourStep } from '@magic-scope/react';
import { Button, Tour } from '@magic-scope/react';
import { type CSSProperties, useRef, useState } from 'react';

// 事件回显:onChange(切步) / onClose(带 reason:skip/escape/mask/finish) / onFinish(走完)。
// 触发跳过、Esc、点遮罩(maskClosable)、走到完成,看 reason 如何区分关闭来源。
export default function Demo() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const pick = (sel: string) => () => scopeRef.current?.querySelector(sel) ?? null;
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 7));

  const steps: TourStep[] = [
    { target: pick('[data-e="a"]'), title: '第一步', description: '点下一步看 onChange。' },
    {
      target: pick('[data-e="b"]'),
      title: '第二步',
      description: '点跳过 / 按 Esc 看 onClose 的 reason。',
    },
    {
      target: pick('[data-e="c"]'),
      title: '第三步',
      description: '点完成看 onFinish + reason=finish。',
    },
  ];

  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-3)', inlineSize: 'min(420px, 100%)' }}>
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
        <span data-e="a" style={chip}>
          甲
        </span>
        <span data-e="b" style={chip}>
          乙
        </span>
        <span data-e="c" style={chip}>
          丙
        </span>
      </div>

      <div>
        <Button
          onClick={() => {
            setCurrent(0);
            setOpen(true);
          }}
        >
          开始(可点遮罩关闭)
        </Button>
      </div>

      <Tour
        steps={steps}
        open={open}
        current={current}
        maskClosable
        onChange={(c) => {
          setCurrent(c);
          push(`onChange(${c})`);
        }}
        onClose={(info) => {
          setOpen(false);
          push(`onClose({ reason: "${info.reason}", current: ${info.current} })`);
        }}
        onFinish={(c) => push(`onFinish(${c})`)}
      />

      {log.length > 0 && (
        <ul
          style={{
            margin: 0,
            paddingInlineStart: '1.1rem',
            color: 'var(--ms-color-fg-muted)',
            fontSize: '0.82rem',
          }}
        >
          {log.map((e) => (
            <li key={e.id}>{e.text}</li>
          ))}
        </ul>
      )}
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
