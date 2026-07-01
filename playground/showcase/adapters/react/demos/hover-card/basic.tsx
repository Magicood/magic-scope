import { HoverCard } from '@magic-scope/react';

// 悬停链接预览:trigger 走 asChild 保留原生 <a>,hover / focus 弹出富内容卡。
export default function Demo() {
  return (
    <p style={{ color: 'var(--ms-color-fg-muted)' }}>
      本组件由{' '}
      <HoverCard>
        <HoverCard.Trigger>
          <a href="#ada" style={{ fontWeight: 600 }}>
            @ada
          </a>
        </HoverCard.Trigger>
        <HoverCard.Content>
          <div style={{ display: 'grid', gap: '0.4rem', maxInlineSize: '220px' }}>
            <strong>Ada Lovelace</strong>
            <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
              139 篇提交 · 12 个仓库
            </span>
          </div>
        </HoverCard.Content>
      </HoverCard>{' '}
      维护。
    </p>
  );
}
