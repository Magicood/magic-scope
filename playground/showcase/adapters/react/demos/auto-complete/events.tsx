import { AutoComplete } from '@magic-scope/react';
import { useRef, useState } from 'react';

// 事件演示:绑 onChange / onSelect / onSearch / onOpenChange / onClear
// 实时回显。注意 onChange(每次键入)与 onSelect(点选 / Enter 选中高亮项)
// 是两条不同通道 —— 后者带完整 option。
const OPTIONS = [{ value: 'Indigo 靛蓝' }, { value: 'Frost 霜蓝' }, { value: 'Ember 余烬橙' }];

export default function Demo() {
  const [value, setValue] = useState('');
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-2)', inlineSize: 'min(380px, 100%)' }}>
      <AutoComplete
        value={value}
        options={OPTIONS}
        allowClear
        placeholder="键入 / 选择 / 清除以触发事件…"
        onChange={(v) => {
          setValue(v);
          push(`onChange("${v}")`);
        }}
        onSearch={(v) => push(`onSearch("${v}")`)}
        onSelect={(v, option) => push(`onSelect("${v}", option.value="${option.value}")`)}
        onOpenChange={(open) => push(`onOpenChange(${open})`)}
        onClear={() => push('onClear()')}
        aria-label="事件演示"
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
