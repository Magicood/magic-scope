import type { FloatButtonShape, FloatButtonTone, FloatButtonType } from '@magic-scope/react';
import { FloatButton } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

/** 收藏(星形)图标,纯装饰,跟随 currentColor。 */
function StarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 17.3 6.2 20.6l1.1-6.5L2.6 9.4l6.5-.9L12 2.6l2.9 5.9 6.5.9-4.7 4.7 1.1 6.5z" />
    </svg>
  );
}

function Playground({ values }: { values: ControlValues }) {
  const [count, setCount] = useState(0);
  const tooltip = (values.tooltip as string) || undefined;
  const description = (values.description as string) || undefined;
  return (
    // 单钮本身 position:relative,可直接内联展示;点击累加,验证事件链路与受控数据。
    <div style={{ display: 'grid', gap: 'var(--ms-space-3)', justifyItems: 'start' }}>
      <FloatButton
        icon={<StarIcon />}
        shape={values.shape as FloatButtonShape}
        type={values.type as FloatButtonType}
        tone={values.tone as FloatButtonTone}
        badge={values.badge as number}
        tooltip={tooltip}
        description={description}
        onClick={() => setCount((c) => c + 1)}
        aria-label="收藏"
      />
      <small style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        已点击 {count} 次
      </small>
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/float-button/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/float-button/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'float-button',
  Playground,
  demos: buildDemos(comps, reactSources),
};
