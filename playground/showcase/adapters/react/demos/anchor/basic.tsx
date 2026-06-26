import type { AnchorItem } from '@magic-scope/react';
import { Anchor } from '@magic-scope/react';
import { useRef } from 'react';

const items: AnchorItem[] = [
  { key: 'install', href: '#b-install', title: '安装' },
  { key: 'usage', href: '#b-usage', title: '基础用法' },
  { key: 'props', href: '#b-props', title: 'Props' },
  { key: 'faq', href: '#b-faq', title: '常见问题' },
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
        targetOffset={16}
        getContainer={() => scrollRef.current ?? window}
        aria-label="文档目录"
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
              点击左侧锚点平滑滚到对应小节;滚动容器时锚点跟随高亮。这是「{it.title}」的占位正文。
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
