import { PinInput } from '@magic-scope/react';
import { useRef, useState } from 'react';

export default function Demo() {
  const [value, setValue] = useState('');
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  return (
    <div style={{ display: 'grid', gap: '0.7rem', inlineSize: 'min(380px, 100%)' }}>
      <PinInput
        value={value}
        onChange={(v) => {
          setValue(v);
          push(`onChange("${v}")`);
        }}
        onComplete={(v) => push(`onComplete("${v}") —— 填满上升沿触发一次`)}
        aria-label="事件演示验证码"
      />
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        当前值:{value || '(空)'}
      </span>
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
