import type { AnchorItem, AnchorSize } from '@magic-scope/react';
import { Anchor } from '@magic-scope/react';
import { useRef } from 'react';

const SIZES: AnchorSize[] = ['sm', 'md', 'lg'];

const items: AnchorItem[] = [
  { key: 's1', href: '#sz-1', title: '第一章' },
  { key: 's2', href: '#sz-2', title: '第二章' },
  { key: 's3', href: '#sz-3', title: '第三章' },
];

export default function Demo() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, auto) minmax(0, 1fr)',
        gap: 'var(--ms-space-6, 1.5rem)',
        alignItems: 'start',
        inlineSize: 'min(640px, 100%)',
      }}
    >
      {SIZES.map((size) => (
        <div key={size} style={{ display: 'grid', gap: 'var(--ms-space-2, 0.5rem)' }}>
          <small style={{ color: 'var(--ms-color-fg-muted, #999)' }}>{size}</small>
          <Anchor
            items={items}
            size={size}
            targetOffset={16}
            getContainer={() => scrollRef.current ?? window}
            aria-label={`尺寸 ${size}`}
          />
        </div>
      ))}
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
              style={{ margin: '0 0 var(--ms-space-2, 0.5rem)', color: 'var(--ms-color-fg, #eee)' }}
            >
              {it.title}
            </h4>
            <p style={{ margin: 0, color: 'var(--ms-color-fg-muted, #999)', lineHeight: 1.7 }}>
              sm / md / lg 三档影响字号、行距与缩进,并随 data-ms-density 缩放。占位正文撑高滚动区。
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
