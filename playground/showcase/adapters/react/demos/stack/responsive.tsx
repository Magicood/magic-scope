import { Stack } from '@magic-scope/react';
import type { CSSProperties } from 'react';

const box: CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  minInlineSize: '5rem',
  minBlockSize: '2.5rem',
  padding: '0.5rem 0.75rem',
  borderRadius: '8px',
  background: 'color-mix(in oklab, var(--ms-color-accent, #7c5cff) 20%, transparent)',
  border: '1px solid color-mix(in oklab, var(--ms-color-accent, #7c5cff) 42%, transparent)',
};

const label: CSSProperties = {
  fontSize: '0.8125rem',
  color: 'var(--ms-color-fg-muted, #888)',
};

/**
 * 响应式:direction / gap 传「断点对象」,窄屏纵向、宽屏(md+)横向。
 * 拖动浏览器宽度或缩放容器即可观察方向切换。另演示 wrap 在空间不足时换行。
 */
export default function Demo() {
  return (
    <Stack gap={6}>
      <span style={label}>
        direction=&#123; base: &apos;vertical&apos;, md: &apos;horizontal&apos; &#125; —
        窄屏纵向、宽屏横向
      </span>
      <Stack direction={{ base: 'vertical', md: 'horizontal' }} gap={{ base: 2, md: 4 }}>
        <div style={box}>导航</div>
        <div style={box}>正文</div>
        <div style={box}>侧栏</div>
      </Stack>

      <span style={label}>wrap=&quot;wrap&quot;:横向放不下时自动折到下一行</span>
      <Stack direction="horizontal" gap={3} wrap="wrap">
        {['标签一', '标签二', '标签三', '标签四', '标签五', '标签六', '标签七', '标签八'].map(
          (t) => (
            <div key={t} style={box}>
              {t}
            </div>
          ),
        )}
      </Stack>
    </Stack>
  );
}
