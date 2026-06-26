import type { FlexAlign, FlexDirection, FlexJustify } from '@magic-scope/react';
import { Flex } from '@magic-scope/react';
import type { ComponentType, CSSProperties } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

// 演示用色块:让 direction / align / justify / gap / wrap 的效果在 Playground 里直接可见。
const boxStyle: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  minInlineSize: '3rem',
  minBlockSize: '2.5rem',
  paddingInline: 'var(--ms-space-3)',
  paddingBlock: 'var(--ms-space-2)',
  borderRadius: 'var(--ms-radius-md)',
  background: 'var(--ms-color-accent-soft, rgba(124, 92, 255, 0.16))',
  color: 'var(--ms-color-fg)',
  fontVariantNumeric: 'tabular-nums',
};

function Playground({ values }: { values: ControlValues }) {
  return (
    <Flex
      direction={values.direction as FlexDirection}
      align={values.align as FlexAlign}
      justify={values.justify as FlexJustify}
      gap={Number(values.gap)}
      wrap={values.wrap as boolean}
      inline={values.inline as boolean}
      style={{
        inlineSize: 'min(420px, 100%)',
        minBlockSize: '8rem',
        padding: 'var(--ms-space-3)',
        borderRadius: 'var(--ms-radius-lg)',
        border: '1px dashed var(--ms-color-border)',
      }}
    >
      <div style={boxStyle}>壹</div>
      <div style={boxStyle}>贰</div>
      <div style={boxStyle}>叁</div>
    </Flex>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/flex/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/flex/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'flex',
  Playground,
  demos: buildDemos(comps, reactSources),
};
