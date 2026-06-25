import { Button, Card } from '@magic-scope/react';

export default function Demo() {
  return (
    <Card variant="elevated" style={{ maxInlineSize: '20rem' }}>
      <h3 style={{ marginBlockStart: 0, marginBlockEnd: '0.25rem' }}>火球术 ✦</h3>
      <p style={{ margin: '0 0 1rem', color: 'var(--ms-color-fg-muted)' }}>
        三环塑能法术,对范围内目标造成爆裂火焰伤害。卡片可自由组合标题、正文与操作区。
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button size="sm">习得</Button>
        <Button size="sm" variant="ghost">
          详情
        </Button>
      </div>
    </Card>
  );
}
