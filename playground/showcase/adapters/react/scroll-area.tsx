import { ScrollArea, type ScrollAreaOrientation, type ScrollAreaType } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

const paragraphs = Array.from({ length: 8 }, (_, i) => i + 1);

function Playground({ values }: { values: ControlValues }) {
  const orientation = values.orientation as ScrollAreaOrientation;
  const horizontal = orientation === 'horizontal' || orientation === 'both';

  return (
    <ScrollArea
      type={values.type as ScrollAreaType}
      orientation={orientation}
      scrollHideDelay={values.scrollHideDelay as number}
      style={{
        blockSize: '200px',
        inlineSize: 'min(360px, 100%)',
        border: '1px solid var(--ms-color-border)',
        borderRadius: 'var(--ms-radius-md)',
      }}
    >
      <div
        style={{
          padding: '0.9rem',
          display: horizontal ? 'inline-block' : 'block',
          whiteSpace: horizontal ? 'nowrap' : 'normal',
          color: 'var(--ms-color-fg-muted)',
        }}
      >
        {paragraphs.map((n) => (
          <p key={n} style={{ margin: '0 0 0.75rem' }}>
            第 {n} 段:自绘滚动条叠在内容上、不占布局宽度,thumb 几何随原生 scrollTop / scrollHeight
            实时同步{horizontal ? ',横向也一样可拖拽反向滚动。' : '。'}
          </p>
        ))}
      </div>
    </ScrollArea>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/scroll-area/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/scroll-area/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'scroll-area',
  Playground,
  demos: buildDemos(comps, reactSources),
};
