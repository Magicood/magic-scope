import { Checkbox } from '@magic-scope/react';
import { useRef, useState } from 'react';

export default function Demo() {
  const [checked, setChecked] = useState(false);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  return (
    <div style={{ display: 'grid', gap: '0.6rem' }}>
      <Checkbox
        checked={checked}
        onCheckedChange={(c) => {
          setChecked(c);
          push(`onCheckedChange(${c})`);
        }}
      >
        我已阅读并同意条款
      </Checkbox>
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        当前:{checked ? '已勾选' : '未勾选'}
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
