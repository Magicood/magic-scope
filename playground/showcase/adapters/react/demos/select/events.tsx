import { Select } from '@magic-scope/react';
import { useRef, useState } from 'react';

const OPTIONS = [
  { value: 'arcane', label: 'Arcane 紫' },
  { value: 'frost', label: 'Frost 青' },
  { value: 'ember', label: 'Ember 品红' },
];

export default function Demo() {
  const [value, setValue] = useState('frost');
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  return (
    <div style={{ display: 'grid', gap: '0.6rem', inlineSize: 'min(380px, 100%)' }}>
      <Select
        value={value}
        options={OPTIONS}
        onChange={(v, option) => {
          setValue(v as string);
          push(`onChange("${v}", option.label=${option?.label ?? '—'})`);
        }}
        onOpenChange={(open) => push(`onOpenChange(${open})`)}
        onClear={() => push('onClear()')}
        aria-label="事件演示"
      />
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>当前值:{value}</span>
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
