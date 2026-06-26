import type { MentionOption } from '@magic-scope/react';
import { Mentions } from '@magic-scope/react';
import { useRef, useState } from 'react';

// 事件演示:onChange 回显完整文本变化,onSelect 在选中候选时回显被选项与本次前缀。
// split 改为「、」演示自定义分隔符:选中后回填的不是空格而是顿号。
const options: MentionOption[] = [
  { value: 'arcanist', label: '奥术师·墨', icon: '🔮', description: '@arcanist' },
  { value: 'frostweaver', label: '霜织者·凛', icon: '❄️', description: '@frost' },
  { value: 'emberkin', label: '余烬使·焰', icon: '🔥', description: '@ember' },
];

export default function Demo() {
  const [text, setText] = useState('召集 @');
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (line: string) =>
    setLog((l) => [{ id: idRef.current++, text: line }, ...l].slice(0, 6));

  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-2)', inlineSize: 'min(440px, 100%)' }}>
      <Mentions
        value={text}
        options={options}
        split="、"
        rows={3}
        onChange={(v) => {
          setText(v);
          push(`onChange("${v}")`);
        }}
        onSelect={(option, prefix) => push(`onSelect(label="${option.label}", prefix="${prefix}")`)}
        placeholder="敲 @ 选人,选中后用「、」分隔…"
        aria-label="事件演示提及"
      />
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        分隔符 split = 「、」
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
