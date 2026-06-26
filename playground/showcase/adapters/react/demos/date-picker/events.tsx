import { DatePicker } from '@magic-scope/react';
import { useRef, useState } from 'react';

export default function Demo() {
  const [value, setValue] = useState<Date | null>(null);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  const fmt = (d: Date | null) => (d ? d.toLocaleDateString('zh-CN') : 'null');

  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-2)', inlineSize: 'min(380px, 100%)' }}>
      <DatePicker
        value={value}
        onChange={(d) => {
          setValue(d);
          push(`onChange(${fmt(d)})`);
        }}
        onOpenChange={(open) => push(`onOpenChange(${open})`)}
        onBlur={() => push('onBlur()')}
        aria-label="事件演示"
      />
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        当前值:{fmt(value)}
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
