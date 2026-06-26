import type { AnchorItem } from '@magic-scope/react';
import { Anchor } from '@magic-scope/react';
import { useRef, useState } from 'react';

// onChange:active 命中变化时回调(滚动或点击触发),无命中为 null
const items: AnchorItem[] = [
  { key: 'mount', href: '#ev-mount', title: '挂载' },
  { key: 'update', href: '#ev-update', title: '更新' },
  { key: 'effect', href: '#ev-effect', title: '副作用' },
  { key: 'cleanup', href: '#ev-cleanup', title: '清理' },
];

export default function Demo() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  return (
    <div
      style={{ display: 'grid', gap: 'var(--ms-space-3, 0.75rem)', inlineSize: 'min(560px, 100%)' }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto minmax(0, 1fr)',
          gap: 'var(--ms-space-6, 1.5rem)',
          alignItems: 'start',
        }}
      >
        <Anchor
          items={items}
          targetOffset={16}
          getContainer={() => scrollRef.current ?? window}
          onChange={(key) => push(`onChange(${key === null ? 'null' : `"${key}"`})`)}
          aria-label="事件演示目录"
        />
        <div
          ref={scrollRef}
          style={{
            blockSize: '220px',
            overflowY: 'auto',
            border: '1px solid var(--ms-color-border, #2a2a2a)',
            borderRadius: 'var(--ms-radius-md, 8px)',
            padding: 'var(--ms-space-4, 1rem)',
          }}
        >
          {items.map((it) => (
            <section
              key={it.key}
              id={it.href.slice(1)}
              style={{ minBlockSize: '150px', paddingBlockEnd: 'var(--ms-space-4, 1rem)' }}
            >
              <h4
                style={{
                  margin: '0 0 var(--ms-space-2, 0.5rem)',
                  color: 'var(--ms-color-fg, #eee)',
                }}
              >
                {it.title}
              </h4>
              <p style={{ margin: 0, color: 'var(--ms-color-fg-muted, #999)', lineHeight: 1.7 }}>
                滚动这块容器或点击锚点,右上的命中变化会实时打到下方日志。
              </p>
            </section>
          ))}
        </div>
      </div>
      {log.length > 0 && (
        <ul
          style={{
            margin: 0,
            paddingInlineStart: '1.1rem',
            color: 'var(--ms-color-fg-muted, #999)',
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
