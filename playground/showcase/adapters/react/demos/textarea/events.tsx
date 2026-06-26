import { Textarea } from '@magic-scope/react';
import { useRef, useState } from 'react';

export default function Demo() {
  const [value, setValue] = useState('');
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 5));

  return (
    <div style={{ display: 'grid', gap: '0.6rem', inlineSize: 'min(380px, 100%)' }}>
      <Textarea
        value={value}
        placeholder="输入多行内容…(Textarea 走原生 onChange)"
        onChange={(e) => {
          setValue(e.target.value);
          push(`onChange → 长度 ${e.target.value.length}`);
        }}
      />
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        当前 {value.length} 字
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
