import type { AnchorItem, AnchorSize } from '@magic-scope/react';
import { Anchor } from '@magic-scope/react';
import { type ComponentType, useRef } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

const items: AnchorItem[] = [
  { key: 'intro', href: '#pg-intro', title: '产品概览' },
  {
    key: 'guide',
    href: '#pg-guide',
    title: '接入指南',
    children: [
      { key: 'install', href: '#pg-install', title: '安装与初始化' },
      { key: 'auth', href: '#pg-auth', title: '鉴权与密钥' },
    ],
  },
  { key: 'api', href: '#pg-api', title: 'API 参考' },
  { key: 'billing', href: '#pg-billing', title: '计费与配额' },
];

const sections: { id: string; title: string }[] = [
  { id: 'pg-intro', title: '产品概览' },
  { id: 'pg-guide', title: '接入指南' },
  { id: 'pg-install', title: '安装与初始化' },
  { id: 'pg-auth', title: '鉴权与密钥' },
  { id: 'pg-api', title: 'API 参考' },
  { id: 'pg-billing', title: '计费与配额' },
];

function Playground({ values }: { values: ControlValues }) {
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
        size={values.size as AnchorSize}
        showInk={values.showInk as boolean}
        offsetTop={values.offsetTop as number}
        targetOffset={values.targetOffset as number}
        bounds={values.bounds as number}
        getContainer={() => scrollRef.current ?? window}
        aria-label="文档目录"
      />
      <div
        ref={scrollRef}
        style={{
          blockSize: '260px',
          overflowY: 'auto',
          border: '1px solid var(--ms-color-border, #2a2a2a)',
          borderRadius: 'var(--ms-radius-md, 8px)',
          padding: 'var(--ms-space-4, 1rem)',
          scrollbarWidth: 'thin',
        }}
      >
        {sections.map((s) => (
          <section
            key={s.id}
            id={s.id}
            style={{ minBlockSize: '180px', paddingBlockEnd: 'var(--ms-space-4, 1rem)' }}
          >
            <h4
              style={{ margin: '0 0 var(--ms-space-2, 0.5rem)', color: 'var(--ms-color-fg, #eee)' }}
            >
              {s.title}
            </h4>
            <p style={{ margin: 0, color: 'var(--ms-color-fg-muted, #999)', lineHeight: 1.7 }}>
              滚动这块容器,左侧锚点会跟随高亮。这里是「{s.title}」的占位正文,用来撑出足够的滚动高度,
              方便观察 scroll-spy 的判定线、墨条平移与各项激活的过渡效果。
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/anchor/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/anchor/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'anchor',
  Playground,
  demos: buildDemos(comps, reactSources),
};
