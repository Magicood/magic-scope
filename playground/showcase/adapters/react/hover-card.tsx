import { HoverCard, type HoverCardPlacement, type HoverCardTone } from '@magic-scope/react';
import type { ComponentType } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  return (
    <HoverCard openDelay={values.openDelay as number} closeDelay={values.closeDelay as number}>
      <HoverCard.Trigger>
        <a href="#ada" style={{ color: 'var(--ms-color-primary, currentColor)', fontWeight: 600 }}>
          @ada
        </a>
      </HoverCard.Trigger>
      <HoverCard.Content
        placement={values.placement as HoverCardPlacement}
        tone={values.tone as HoverCardTone}
        arrow={values.arrow as boolean}
      >
        <div style={{ display: 'grid', gap: '0.5rem', maxInlineSize: '240px' }}>
          <strong>Ada Lovelace</strong>
          <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
            世界上第一位程序员。把指针从链接移进这张卡片,不会误关。
          </p>
          <a href="#follow" style={{ fontSize: '0.85rem' }}>
            关注
          </a>
        </div>
      </HoverCard.Content>
    </HoverCard>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/hover-card/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/hover-card/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'hover-card',
  Playground,
  demos: buildDemos(comps, reactSources),
};
