import { Marquee, type MarqueeDirection } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

const chips = ['Vela', 'Aurora', 'Prism', 'Nebula', 'Comet', 'Quartz', 'Zephyr', 'Lumen'];

function Playground({ values }: { values: ControlValues }) {
  const direction = values.direction as MarqueeDirection;
  const vertical = direction === 'up' || direction === 'down';

  return (
    <div style={{ inlineSize: 'min(520px, 100%)', blockSize: vertical ? '160px' : 'auto' }}>
      <Marquee
        direction={direction}
        speed={values.speed as number}
        pauseOnHover={values.pauseOnHover as boolean}
        gradient={values.gradient as boolean}
        reverse={values.reverse as boolean}
        aria-label="示例跑马灯"
        style={{ blockSize: '100%' }}
      >
        {chips.map((c) => (
          <span
            key={c}
            style={{
              margin: vertical ? '0.4rem 0' : '0 0.6rem',
              padding: '0.4rem 0.9rem',
              borderRadius: 'var(--ms-radius-pill, 999px)',
              background: 'var(--ms-color-bg-subtle)',
              color: 'var(--ms-color-fg-muted)',
              whiteSpace: 'nowrap',
            }}
          >
            {c}
          </span>
        ))}
      </Marquee>
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/marquee/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/marquee/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'marquee',
  Playground,
  demos: buildDemos(comps, reactSources),
};
