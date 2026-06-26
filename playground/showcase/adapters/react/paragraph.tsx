import type {
  ParagraphAlign,
  ParagraphLeading,
  ParagraphSize,
  ParagraphTone,
} from '@magic-scope/react';
import { Paragraph } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const tone = values.tone as ParagraphTone;
  const align = values.align as ParagraphAlign;
  return (
    <Paragraph
      size={values.size as ParagraphSize}
      leading={values.leading as ParagraphLeading}
      tone={tone === 'neutral' ? undefined : tone}
      align={align === 'start' ? undefined : align}
      dimmed={values.dimmed as boolean}
      style={{ maxInlineSize: 'min(520px, 100%)' }}
    >
      {values.children as string}
    </Paragraph>
  );
}

// 真实 demo 文件：同一文件既 import 渲染、又 ?raw 取源码（永不漂移）。
const comps = import.meta.glob<{ default: ComponentType }>('./demos/paragraph/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/paragraph/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'paragraph',
  Playground,
  demos: buildDemos(comps, reactSources),
};
