import { Card } from '@magic-scope/react';

export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Card variant="elevated" style={{ maxInlineSize: '16rem' }}>
        <strong>elevated</strong>
        <p style={{ margin: '0.5rem 0 0', color: 'var(--ms-color-fg-muted)' }}>
          surface 底 + 柔和阴影,适合浮在背景之上的内容块。
        </p>
      </Card>
      <Card variant="outline" style={{ maxInlineSize: '16rem' }}>
        <strong>outline</strong>
        <p style={{ margin: '0.5rem 0 0', color: 'var(--ms-color-fg-muted)' }}>
          透明底 + 描边,适合与背景同层、轻量分隔的场景。
        </p>
      </Card>
    </div>
  );
}
