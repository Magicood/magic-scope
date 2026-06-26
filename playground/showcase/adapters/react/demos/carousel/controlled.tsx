import { Carousel } from '@magic-scope/react';
import { useRef, useState } from 'react';

// 受控 + 命令式:传入 activeIndex 进入受控模式,外部缩略图驱动当前屏;
// 同时演示经 ref 暴露的命令式 goTo(挂在根 DOM 节点上,ref.current.goTo(i))。
const SLIDES = [
  { title: '苍穹', bg: 'var(--ms-color-info)' },
  { title: '密林', bg: 'var(--ms-color-success)' },
  { title: '熔岩', bg: 'var(--ms-color-warning)' },
  { title: '深渊', bg: 'var(--ms-color-accent)' },
];

type CarouselNode = HTMLDivElement & { goTo?: (i: number) => void };

export default function Demo() {
  const [index, setIndex] = useState(0);
  const ref = useRef<CarouselNode>(null);

  return (
    <div style={{ display: 'grid', gap: '0.6rem', inlineSize: 'min(460px, 100%)' }}>
      <Carousel
        ref={ref}
        activeIndex={index}
        onChange={setIndex}
        arrows={false}
        aria-label="受控轮播"
      >
        {SLIDES.map((s) => (
          <div
            key={s.title}
            style={{
              display: 'grid',
              placeContent: 'center',
              blockSize: '200px',
              fontSize: '2rem',
              fontWeight: 700,
              color: '#fff',
              background: s.bg,
            }}
          >
            {s.title}
          </div>
        ))}
      </Carousel>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {SLIDES.map((s, i) => (
          <button
            key={s.title}
            type="button"
            // 一半走受控 setIndex,一半走命令式 ref.goTo,演示两条通道等价。
            onClick={() => (i % 2 === 0 ? setIndex(i) : ref.current?.goTo?.(i))}
            style={{
              padding: '0.35rem 0.7rem',
              fontSize: '0.85rem',
              cursor: 'pointer',
              color: i === index ? '#fff' : 'var(--ms-color-fg)',
              background: i === index ? 'var(--ms-color-primary)' : 'transparent',
              border: '1px solid color-mix(in oklch, var(--ms-color-fg) 18%, transparent)',
              borderRadius: 'var(--ms-radius-2, 0.5rem)',
            }}
          >
            {i + 1}. {s.title}
          </button>
        ))}
      </div>
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        奇数屏经命令式 ref.goTo 跳转,偶数屏经受控 activeIndex。当前:第 {index + 1} 屏
      </small>
    </div>
  );
}
