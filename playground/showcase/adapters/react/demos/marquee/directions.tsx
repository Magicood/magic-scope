import { Marquee } from '@magic-scope/react';

const tags = ['#新品', '#限时', '#热销', '#会员', '#包邮'];

function Row({ label, direction }: { label: string; direction: 'left' | 'right' }) {
  return (
    <div style={{ display: 'grid', gap: '0.3rem' }}>
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>{label}</small>
      <Marquee direction={direction} speed={45} gradient aria-label={label}>
        {tags.map((t) => (
          <span key={t} style={{ margin: '0 0.8rem', color: 'var(--ms-color-fg-muted)' }}>
            {t}
          </span>
        ))}
      </Marquee>
    </div>
  );
}

// 双向反向滚动:上一行向左、下一行向右,常用于叠放的动态背景条。
export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1rem', inlineSize: 'min(480px, 100%)' }}>
      <Row label="direction=left" direction="left" />
      <Row label="direction=right" direction="right" />
    </div>
  );
}
