import type { BackTopShape, BackTopTone } from '@magic-scope/react';
import { BackTop } from '@magic-scope/react';
import { type ComponentType, useRef } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

// BackTop 是 position:fixed 的浮钮,默认贴视口右下;为了在演示框内可见,
// 这里用一个带 transform 的本地滚动容器作为「新的定位上下文」,并把 target 指向它。
// 阈值用旋钮的 visibilityHeight,滚动几行内容即可看到淡入。
function Playground({ values }: { values: ControlValues }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={scrollRef}
      style={{
        position: 'relative',
        // transform 让其后代 fixed 元素相对本容器定位,而非视口
        transform: 'translateZ(0)',
        inlineSize: 'min(420px, 100%)',
        blockSize: '220px',
        overflow: 'auto',
        padding: 'var(--ms-space-4, 1rem)',
        border: '1px solid var(--ms-color-border)',
        borderRadius: 'var(--ms-radius-lg, 0.75rem)',
        background: 'var(--ms-color-surface)',
      }}
    >
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        ↓ 在框内向下滚动,浮钮会从右下淡入。
      </p>
      <div style={{ blockSize: '900px' }} aria-hidden="true" />
      <BackTop
        target={() => scrollRef.current ?? window}
        tone={values.tone as BackTopTone}
        shape={values.shape as BackTopShape}
        visibilityHeight={values.visibilityHeight as number}
        duration={values.duration as number}
        right={16}
        bottom={16}
      />
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/back-top/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/back-top/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'back-top',
  Playground,
  demos: buildDemos(comps, reactSources),
};
