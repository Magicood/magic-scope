import { Splitter } from '@magic-scope/react';
import { useRef, useState } from 'react';

// 演示用面板:统一外观。
function Pane({ children }: { children: string }) {
  return (
    <div
      style={{
        blockSize: '100%',
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--ms-space-3, 0.75rem)',
        background: 'var(--ms-color-surface-raised, rgba(127, 127, 127, 0.12))',
        color: 'var(--ms-color-fg-muted)',
        fontSize: '0.82rem',
      }}
    >
      {children}
    </div>
  );
}

// 事件回显:高频 onResize 与落定 onResizeEnd 分别打点(拖动中缝 / 用键盘聚焦中缝后按方向键)。
export default function Demo() {
  const [percents, setPercents] = useState<number[]>([]);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  const fmt = (arr: number[]) => arr.map((n) => `${Math.round(n)}%`).join(' / ');

  return (
    <div
      style={{ display: 'grid', gap: 'var(--ms-space-3, 0.75rem)', inlineSize: 'min(38rem, 100%)' }}
    >
      <Splitter
        onResize={(detail) => setPercents(detail.percents)}
        onResizeEnd={(detail) => push(`onResizeEnd(${fmt(detail.percents)})`)}
        style={{
          blockSize: '10rem',
          border: '1px solid var(--ms-color-border, rgba(127, 127, 127, 0.24))',
          borderRadius: 'var(--ms-radius-md, 0.5rem)',
          overflow: 'hidden',
        }}
      >
        <Splitter.Panel min={80} defaultSize="40%">
          <Pane>左</Pane>
        </Splitter.Panel>
        <Splitter.Panel min={80}>
          <Pane>右</Pane>
        </Splitter.Panel>
      </Splitter>
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        当前占比(onResize):{percents.length ? fmt(percents) : '拖动中缝试试'}
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
