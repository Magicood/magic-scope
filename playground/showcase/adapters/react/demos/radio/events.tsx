import { Radio, RadioGroup } from '@magic-scope/react';
import { useRef, useState } from 'react';

export default function Demo() {
  const [value, setValue] = useState('free');
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  return (
    <div style={{ display: 'grid', gap: '0.6rem' }}>
      <RadioGroup
        value={value}
        onValueChange={(v) => {
          setValue(v);
          push(`onValueChange("${v}")`);
        }}
        aria-label="套餐"
      >
        <Radio value="free">Free</Radio>
        <Radio value="pro">Pro</Radio>
        <Radio value="ent">Enterprise</Radio>
      </RadioGroup>
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        当前选中:{value}
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
