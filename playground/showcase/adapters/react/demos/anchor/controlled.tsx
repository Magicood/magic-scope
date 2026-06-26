import type { AnchorItem } from '@magic-scope/react';
import { Anchor } from '@magic-scope/react';
import { useRef, useState } from 'react';

// 受控:activeKey 由外部 state 决定;Anchor 仍会调 onChange 上报滚动算出的命中
const items: AnchorItem[] = [
  { key: 'a', href: '#ct-a', title: '序章' },
  { key: 'b', href: '#ct-b', title: '发展' },
  { key: 'c', href: '#ct-c', title: '高潮' },
  { key: 'd', href: '#ct-d', title: '尾声' },
];

export default function Demo() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState<string | null>('a');
  return (
    <div
      style={{ display: 'grid', gap: 'var(--ms-space-3, 0.75rem)', inlineSize: 'min(560px, 100%)' }}
    >
      <div style={{ display: 'flex', gap: 'var(--ms-space-2, 0.5rem)', flexWrap: 'wrap' }}>
        {items.map((it) => (
          <button
            type="button"
            key={it.key}
            onClick={() => setActive(it.key)}
            style={{
              padding: 'var(--ms-space-1, 0.25rem) var(--ms-space-3, 0.75rem)',
              borderRadius: 'var(--ms-radius-sm, 6px)',
              border: '1px solid var(--ms-color-border, #2a2a2a)',
              background: active === it.key ? 'var(--ms-color-primary, #6d5dfc)' : 'transparent',
              color: active === it.key ? '#fff' : 'var(--ms-color-fg-muted, #999)',
              cursor: 'pointer',
            }}
          >
            {it.title}
          </button>
        ))}
      </div>
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
          activeKey={active}
          onChange={setActive}
          targetOffset={16}
          getContainer={() => scrollRef.current ?? window}
          aria-label="受控目录"
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
                上方按钮直接改写受控 activeKey;滚动容器时 onChange 仍会同步回 state。
              </p>
            </section>
          ))}
        </div>
      </div>
      <small style={{ color: 'var(--ms-color-fg-muted, #999)' }}>
        当前 activeKey:{active ?? '—'}
      </small>
    </div>
  );
}
