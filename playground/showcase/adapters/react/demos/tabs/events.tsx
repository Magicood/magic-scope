import type { TabItem } from '@magic-scope/react';
import { Tabs } from '@magic-scope/react';
import type { MouseEvent } from 'react';
import { useRef, useState } from 'react';

const items: TabItem[] = [
  {
    value: 'arcane',
    label: 'Arcane 奥术',
    content: <p style={{ margin: 0 }}>奥术系:瞬发与爆发。</p>,
  },
  {
    value: 'frost',
    label: 'Frost 冰霜',
    content: <p style={{ margin: 0 }}>冰霜系:减速与控场。</p>,
  },
  { value: 'ember', label: 'Ember 余烬', content: <p style={{ margin: 0 }}>余烬系:持续灼烧。</p> },
  {
    value: 'void',
    label: 'Void 虚空',
    disabled: true,
    content: <p style={{ margin: 0 }}>尚未解锁。</p>,
  },
];

// 事件触发实时 demo:绑定 onChange / onTabClick,每次触发把「事件名 + 实参」打到列表。
// 受控选中值用 useState 回显;onTabClick 在点「已选中」标签时也会触发(此时 onChange 不触发),
// 可借此观察两个事件的差异;勾选「锁定」后 onTabClick 调用 preventDefault 阻断内部切换。
export default function Demo() {
  const [value, setValue] = useState('frost');
  const [locked, setLocked] = useState(false);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  const handleChange = (next: string) => {
    setValue(next);
    push(`onChange(value: "${next}")`);
  };

  const handleTabClick = (clicked: string, event: MouseEvent<HTMLDivElement>) => {
    const same = clicked === value;
    if (locked) {
      // 命令式确认:阻断内部切换,onChange 不会再触发,列表也不会出现 onChange 行。
      event.preventDefault();
    }
    push(
      `onTabClick(value: "${clicked}", event: ${event.type})` +
        (same ? ' · 点的是已选中项,onChange 不触发' : '') +
        (locked ? ' · 已 preventDefault,切换被阻断' : ''),
    );
  };

  return (
    <div style={{ display: 'grid', gap: '0.75rem', inlineSize: 'min(32rem, 100%)' }}>
      <Tabs items={items} value={value} onChange={handleChange} onTabClick={handleTabClick} />

      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          fontSize: '0.85rem',
          color: 'var(--ms-color-fg-muted)',
        }}
      >
        <span>
          受控选中:<code>{value}</code>
        </span>
        <label style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
          <input type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} />
          锁定切换(onTabClick 里 preventDefault)
        </label>
        <button
          type="button"
          onClick={() => setLog([])}
          style={{
            cursor: 'pointer',
            background: 'none',
            border: '1px solid var(--ms-color-border, currentColor)',
            borderRadius: '0.375rem',
            padding: '0.15rem 0.5rem',
            color: 'inherit',
            font: 'inherit',
          }}
        >
          清空日志
        </button>
      </div>

      {log.length > 0 ? (
        <ul
          style={{
            margin: 0,
            paddingInlineStart: '1.1rem',
            color: 'var(--ms-color-fg-muted)',
            fontSize: '0.85rem',
            lineHeight: 1.7,
          }}
        >
          {log.map((e) => (
            <li key={e.id}>
              <code>{e.text}</code>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
          点击上方标签:onChange / onTabClick
          触发会实时打印到此处。点「已选中」项或禁用项可观察事件差异。
        </p>
      )}
    </div>
  );
}
