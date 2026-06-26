import type { AnchorItem } from '@magic-scope/react';
import { Anchor } from '@magic-scope/react';
import { useRef } from 'react';

// 多层嵌套:children 形成缩进树,墨条会落到任意层级的当前项
const items: AnchorItem[] = [
  {
    key: 'guide',
    href: '#nz-guide',
    title: '入门指南',
    children: [
      { key: 'quickstart', href: '#nz-quickstart', title: '快速开始' },
      { key: 'concepts', href: '#nz-concepts', title: '核心概念' },
    ],
  },
  {
    key: 'api',
    href: '#nz-api',
    title: 'API 参考',
    children: [
      { key: 'hooks', href: '#nz-hooks', title: 'Hooks' },
      {
        key: 'components',
        href: '#nz-components',
        title: '组件',
        children: [
          { key: 'anchor', href: '#nz-anchor', title: 'Anchor' },
          { key: 'tabs', href: '#nz-tabs', title: 'Tabs' },
        ],
      },
    ],
  },
];

const flat: { id: string; title: string }[] = [
  { id: 'nz-guide', title: '入门指南' },
  { id: 'nz-quickstart', title: '快速开始' },
  { id: 'nz-concepts', title: '核心概念' },
  { id: 'nz-api', title: 'API 参考' },
  { id: 'nz-hooks', title: 'Hooks' },
  { id: 'nz-components', title: '组件' },
  { id: 'nz-anchor', title: 'Anchor' },
  { id: 'nz-tabs', title: 'Tabs' },
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
        inlineSize: 'min(560px, 100%)',
      }}
    >
      <Anchor
        items={items}
        targetOffset={16}
        getContainer={() => scrollRef.current ?? window}
        aria-label="嵌套目录树"
      />
      <div
        ref={scrollRef}
        style={{
          blockSize: '260px',
          overflowY: 'auto',
          border: '1px solid var(--ms-color-border, #2a2a2a)',
          borderRadius: 'var(--ms-radius-md, 8px)',
          padding: 'var(--ms-space-4, 1rem)',
        }}
      >
        {flat.map((s) => (
          <section
            key={s.id}
            id={s.id}
            style={{ minBlockSize: '140px', paddingBlockEnd: 'var(--ms-space-4, 1rem)' }}
          >
            <h4
              style={{ margin: '0 0 var(--ms-space-2, 0.5rem)', color: 'var(--ms-color-fg, #eee)' }}
            >
              {s.title}
            </h4>
            <p style={{ margin: 0, color: 'var(--ms-color-fg-muted, #999)', lineHeight: 1.7 }}>
              子项按层级缩进,高亮会精确落到当前所在的任意层级。「{s.title}」占位正文。
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
