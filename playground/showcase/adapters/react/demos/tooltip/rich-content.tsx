import { Button, Tooltip } from '@magic-scope/react';

export default function Demo() {
  return (
    <Tooltip
      content={
        <div style={{ display: 'grid', gap: '0.35rem', maxInlineSize: '16rem' }}>
          <strong>奥术飞弹</strong>
          <span style={{ color: 'var(--ms-color-fg-muted)' }}>
            塑能系 · 法力 3 · 必中三道魔法飞弹。
          </span>
        </div>
      }
    >
      <Button variant="outline">富文本提示</Button>
    </Tooltip>
  );
}
