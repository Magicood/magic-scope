import { Rate } from '@magic-scope/react';
import { useRef, useState } from 'react';

export default function Demo() {
  const [value, setValue] = useState(3);
  const [hover, setHover] = useState(-1);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  return (
    <div style={{ display: 'grid', gap: '0.6rem' }}>
      <Rate
        value={value}
        onChange={(v) => {
          setValue(v);
          push(`onChange(${v})`);
        }}
        onHoverChange={(v) => setHover(v)}
        aria-label="评分"
      />
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        评分:{value}
        {hover >= 0 ? ` · 悬停中 onHoverChange(${hover})` : ''}
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
