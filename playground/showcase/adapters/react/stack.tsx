import type {
  SpaceToken,
  StackAlign,
  StackDirection,
  StackJustify,
  StackWrap,
} from '@magic-scope/react';
import { Stack } from '@magic-scope/react';
import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

// 占位块:用半透明奥术色块直观展示堆叠/对齐/分布,不依赖文字内容。
const blockStyle: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  minInlineSize: '3.5rem',
  minBlockSize: '2.25rem',
  padding: '0.5rem 0.75rem',
  borderRadius: 'var(--ms-radius-2, 8px)',
  background: 'color-mix(in oklab, var(--ms-color-accent, #7c5cff) 22%, transparent)',
  border: '1px solid color-mix(in oklab, var(--ms-color-accent, #7c5cff) 45%, transparent)',
  color: 'var(--ms-color-fg, currentColor)',
  fontVariantNumeric: 'tabular-nums',
};

function Block({ children }: { children: ReactNode }) {
  return <div style={blockStyle}>{children}</div>;
}

function Playground({ values }: { values: ControlValues }) {
  return (
    <Stack
      direction={values.direction as StackDirection}
      gap={Number(values.gap) as SpaceToken}
      align={values.align as StackAlign}
      justify={values.justify as StackJustify}
      wrap={values.wrap as StackWrap}
      inline={values.inline as boolean}
      style={{
        inlineSize: 'min(420px, 100%)',
        minBlockSize: '8rem',
        padding: '0.75rem',
        borderRadius: 'var(--ms-radius-3, 12px)',
        border: '1px dashed color-mix(in oklab, var(--ms-color-fg, #888) 28%, transparent)',
      }}
    >
      <Block>壹</Block>
      <Block>贰</Block>
      <Block>叁</Block>
    </Stack>
  );
}

// 真实 demo 文件:同一文件既 import 渲染、又 ?raw 取源码(永不漂移)。
const comps = import.meta.glob<{ default: ComponentType }>('./demos/stack/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/stack/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'stack',
  Playground,
  demos: buildDemos(comps, reactSources),
};
