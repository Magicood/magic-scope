import type { AnchorItem } from '@magic-scope/react';
import { Anchor } from '@magic-scope/react';
import { useRef } from 'react';

// ariaLabel:覆盖 nav 的 landmark 可访问名(驼峰 prop,区别于原生 aria-label)。
const items: AnchorItem[] = [
  { key: 'intro', href: '#s-intro', title: '简介' },
  { key: 'setup', href: '#s-setup', title: '安装' },
  { key: 'api', href: '#s-api', title: 'API' },
];

export default function Demo() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto minmax(0, 1fr)',
        gap: '1.5rem',
        alignItems: 'start',
        inlineSize: 'min(480px, 100%)',
      }}
    >
      <Anchor
        items={items}
        ariaLabel="本页目录"
        targetOffset={12}
        getContainer={() => scrollRef.current ?? window}
      />
      <div
        ref={scrollRef}
        style={{
          blockSize: '200px',
          overflowY: 'auto',
          border: '1px solid var(--ms-color-border)',
          borderRadius: 'var(--ms-radius-md)',
          padding: '0.75rem',
        }}
      >
        {items.map((it) => (
          <section key={it.key} id={it.href.slice(1)} style={{ minBlockSize: '130px' }}>
            <h4 style={{ margin: '0 0 0.3rem', color: 'var(--ms-color-fg)' }}>{it.title}</h4>
            <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
              「{it.title}」小节,点左侧锚点平滑滚动到此。
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
