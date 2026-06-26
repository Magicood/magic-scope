import { NumberInput } from '@magic-scope/react';
import { useRef, useState } from 'react';

export default function Demo() {
  const [value, setValue] = useState<number | null>(3);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  return (
    <div style={{ display: 'grid', gap: '0.6rem' }}>
      <NumberInput
        value={value ?? undefined}
        min={0}
        max={99}
        onValueChange={(v) => {
          setValue(v);
          push(`onValueChange(${v === null ? 'null' : v})`);
        }}
        aria-label="数量"
      />
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        当前值:{value === null ? '(空)' : value}
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
