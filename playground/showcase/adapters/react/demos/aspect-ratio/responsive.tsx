import { AspectRatio } from '@magic-scope/react';

/**
 * 响应式比例:窄屏竖图(3 / 4)→ 平板宽屏(16 / 9)→ 桌面超宽(21 / 9)。
 * 纯静态 CSS @media 渐进切换(min-width),零运行时、零 resize 监听 —— 拖窗口看比例变化。
 * 同时演示 asChild(Slot 风格):比例盒样式合并到子 img,不额外包一层 DOM。
 */
export default function Demo() {
  return (
    <div style={{ inlineSize: 'min(560px, 100%)' }}>
      <AspectRatio ratio={{ base: 3 / 4, md: 16 / 9, lg: 21 / 9 }} rounded="lg" asChild>
        <img
          src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80"
          alt="星空"
        />
      </AspectRatio>
      <p
        style={{
          margin: 'var(--ms-space-2) 0 0',
          color: 'var(--ms-color-fg-muted)',
          fontSize: '0.85rem',
        }}
      >
        base 3 / 4 · md 16 / 9 · lg 21 / 9 —— 拖动窗口宽度观察比例切换
      </p>
    </div>
  );
}
