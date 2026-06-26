import { ColorPicker } from '@magic-scope/react';
import { useRef, useState } from 'react';

// 专有事件回显:onChange(格式化后的颜色串)与 onOpenChange(浮层开合)实时记录。
export default function Demo() {
  const [color, setColor] = useState('#7c3aed');
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  return (
    <div style={{ display: 'grid', gap: '0.6rem', inlineSize: 'min(380px, 100%)' }}>
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
        <ColorPicker
          value={color}
          onChange={(v) => {
            setColor(v);
            push(`onChange("${v}")`);
          }}
          onOpenChange={(open) => push(`onOpenChange(${open})`)}
          aria-label="事件演示"
        />
        <code style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>{color}</code>
      </div>
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
