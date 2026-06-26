import { Carousel } from '@magic-scope/react';
import { useRef, useState } from 'react';

// 事件演示:onChange(index) 在箭头 / 指示点 / 拖拽 / 自动播放任一触发切换时回调,实时回显。
const SLIDES = [
  { title: '第一幕', bg: 'var(--ms-color-primary)' },
  { title: '第二幕', bg: 'var(--ms-color-accent)' },
  { title: '第三幕', bg: 'var(--ms-color-info)' },
  { title: '第四幕', bg: 'var(--ms-color-success)' },
];

export default function Demo() {
  const [index, setIndex] = useState(0);
  const [log, setLog] = useState<{ id: number; text: string }[]>([]);
  const idRef = useRef(0);
  const push = (text: string) => setLog((l) => [{ id: idRef.current++, text }, ...l].slice(0, 6));

  return (
    <div style={{ display: 'grid', gap: '0.6rem', inlineSize: 'min(460px, 100%)' }}>
      <Carousel
        defaultIndex={0}
        onChange={(i) => {
          setIndex(i);
          push(`onChange(${i}) → 第 ${i + 1} 屏`);
        }}
        tone="accent"
        aria-label="事件演示轮播"
      >
        {SLIDES.map((s) => (
          <div
            key={s.title}
            style={{
              display: 'grid',
              placeContent: 'center',
              blockSize: '180px',
              fontSize: '1.7rem',
              fontWeight: 700,
              color: '#fff',
              background: s.bg,
            }}
          >
            {s.title}
          </div>
        ))}
      </Carousel>
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        当前索引:{index}(用箭头 / 指示点 / 拖拽切换看回显)
      </span>
      {log.length > 0 && (
        <ul
          style={{
            margin: 0,
            paddingInlineStart: '1.1rem',
            color: 'var(--ms-color-fg-muted)',
            fontSize: '0.82rem',
          }}
        >
          {log.map((e) => (
            <li key={e.id}>{e.text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
