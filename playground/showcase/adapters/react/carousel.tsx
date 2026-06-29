import type { CarouselEffect, CarouselTone } from '@magic-scope/react';
import { Carousel } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

// 演示用 slide:四块渐变面板,文案居中,展示 children 即一屏的直觉 API。
const SLIDES: { title: string; sub: string; from: string; to: string }[] = [
  {
    title: '数据概览',
    sub: '第一屏 · Overview',
    from: 'var(--ms-color-primary)',
    to: 'var(--ms-color-accent)',
  },
  {
    title: '团队协作',
    sub: '第二屏 · Team',
    from: 'var(--ms-color-info)',
    to: 'var(--ms-color-primary)',
  },
  {
    title: '集成与自动化',
    sub: '第三屏 · Integrations',
    from: 'var(--ms-color-danger)',
    to: 'var(--ms-color-warning)',
  },
  {
    title: '安全与权限',
    sub: '第四屏 · Security',
    from: 'var(--ms-color-accent)',
    to: 'var(--ms-color-success)',
  },
];

function Slide({ title, sub, from, to }: (typeof SLIDES)[number]) {
  return (
    <div
      style={{
        display: 'grid',
        placeContent: 'center',
        gap: 'var(--ms-space-1)',
        blockSize: '220px',
        textAlign: 'center',
        color: '#fff',
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      <strong style={{ fontSize: '1.5rem' }}>{title}</strong>
      <span style={{ opacity: 0.85, fontSize: '0.85rem' }}>{sub}</span>
    </div>
  );
}

function Playground({ values }: { values: ControlValues }) {
  const [index, setIndex] = useState(0);
  return (
    <div style={{ display: 'grid', gap: '0.6rem', inlineSize: 'min(480px, 100%)' }}>
      <Carousel
        activeIndex={index}
        onChange={setIndex}
        effect={values.effect as CarouselEffect}
        tone={values.tone as CarouselTone}
        vertical={values.vertical as boolean}
        loop={values.loop as boolean}
        autoplay={values.autoplay as boolean}
        dots={values.dots as boolean}
        arrows={values.arrows as boolean}
        draggable={values.draggable as boolean}
        aria-label="参数演示轮播"
      >
        {SLIDES.map((s) => (
          <Slide key={s.title} {...s} />
        ))}
      </Carousel>
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        当前第 {index + 1} / {SLIDES.length} 屏
      </small>
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/carousel/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/carousel/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'carousel',
  Playground,
  demos: buildDemos(comps, reactSources),
};
