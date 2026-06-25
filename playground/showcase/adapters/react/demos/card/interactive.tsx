import { Card } from '@magic-scope/react';

export default function Demo() {
  return (
    <Card
      variant="elevated"
      interactive
      onClick={() => alert('卡片被点击')}
      style={{ maxInlineSize: '16rem' }}
    >
      <strong>interactive 可交互</strong>
      <p style={{ margin: '0.5rem 0 0', color: 'var(--ms-color-fg-muted)' }}>
        开启后整张卡片可点击:hover 上浮发光,默认 tabIndex 0 可键盘聚焦,带 focus-visible 聚焦环。
      </p>
    </Card>
  );
}
