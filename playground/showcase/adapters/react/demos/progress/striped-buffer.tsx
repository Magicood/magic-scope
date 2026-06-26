import type { ProgressSize } from '@magic-scope/react';
import { Progress } from '@magic-scope/react';

/**
 * 填充质感与缓冲:
 *  - striped 斜纹填充,叠加 animated 让斜纹流动(受 data-ms-motion 与 prefers-reduced-motion 门控)。
 *  - buffer 缓冲段绘在 fill 之下、track 之上,演示「已加载未播放」语义(如视频缓冲)。
 *  - size 三档(sm / md / lg)改条高,随 data-ms-density 缩放。
 */
const SIZES: { size: ProgressSize; label: string }[] = [
  { size: 'sm', label: 'sm 细' },
  { size: 'md', label: 'md 中' },
  { size: 'lg', label: 'lg 粗' },
];

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1.25rem', inlineSize: '100%' }}>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--ms-color-fg-muted)' }}>
          striped 静态斜纹 / striped + animated 流动斜纹
        </span>
        <Progress value={60} striped showValue aria-label="斜纹 60%" />
        <Progress value={60} striped animated tone="accent" showValue aria-label="流动斜纹 60%" />
      </div>

      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--ms-color-fg-muted)' }}>
          buffer 缓冲段(fill 40% · buffer 75%,如视频已缓冲未播放)
        </span>
        <Progress value={40} buffer={75} tone="info" showValue aria-label="缓冲 40% / 75%" />
      </div>

      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--ms-color-fg-muted)' }}>
          size 三档条高
        </span>
        {SIZES.map(({ size, label }) => (
          <Progress key={size} size={size} value={70} aria-label={`${label} 70%`} />
        ))}
      </div>
    </div>
  );
}
