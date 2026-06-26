import type { AnchorItem } from '@magic-scope/react';
import { Anchor } from '@magic-scope/react';
import { useRef } from 'react';

// showInk=false:关闭墨条指示器,只靠 active 链接的文字态高亮(更克制的样式)
const items: AnchorItem[] = [
  { key: 'p1', href: '#ni-1', title: '设计原则' },
  { key: 'p2', href: '#ni-2', title: '色彩系统' },
  { key: 'p3', href: '#ni-3', title: '排版网格' },
  { key: 'p4', href: '#ni-4', title: '动效规范' },
];

export default function Demo() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto minmax(0, 1fr)',
        gap: 'var(--ms-space-6, 1.5rem)',
        alignItems: 'start',
        inlineSize: 'min(520px, 100%)',
      }}
    >
      <Anchor
        items={items}
        showInk={false}
        targetOffset={16}
        getContainer={() => scrollRef.current ?? window}
        aria-label="无墨条目录"
      />
      <div
        ref={scrollRef}
        style={{
          blockSize: '240px',
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
            style={{ minBlockSize: '160px', paddingBlockEnd: 'var(--ms-space-4, 1rem)' }}
          >
            <h4
              style={{ margin: '0 0 var(--ms-space-2, 0.5rem)', color: 'var(--ms-color-fg, #eee)' }}
            >
              {it.title}
            </h4>
            <p style={{ margin: 0, color: 'var(--ms-color-fg-muted, #999)', lineHeight: 1.7 }}>
              关闭墨条后,激活态完全交给链接文字样式,视觉更克制。「{it.title}」占位正文。
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
