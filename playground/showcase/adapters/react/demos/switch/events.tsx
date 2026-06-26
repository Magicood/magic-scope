import { Switch } from '@magic-scope/react';
import { useRef, useState } from 'react';

export default function Demo() {
  const [checked, setChecked] = useState(false);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  return (
    <div style={{ display: 'grid', gap: '0.6rem' }}>
      <Switch
        checked={checked}
        onChange={(e) => {
          setChecked(e.target.checked);
          push(`onChange → e.target.checked = ${e.target.checked}`);
        }}
      >
        记住我
      </Switch>
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        当前:{checked ? '开' : '关'}（Switch 走原生 onChange,从 e.target.checked 取值)
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
