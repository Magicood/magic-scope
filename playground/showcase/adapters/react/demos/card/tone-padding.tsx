import { Card } from '@magic-scope/react';

// tone 语义色调:经全库 tone resolver 派生描边 / 发光 / 柔底,覆盖 7 色。
// padding 内边距档位(随密度缩放):none 供满血媒体 / sm / md / lg。
const TONES = ['primary', 'accent', 'success', 'warning', 'danger', 'info', 'neutral'] as const;
const PADDINGS = ['none', 'sm', 'md', 'lg'] as const;

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--ms-color-fg-muted)' }}>
          tone 语义色调(outline 变体最能看清描边差异)
        </span>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {TONES.map((tone) => (
            <Card key={tone} variant="outline" tone={tone} style={{ inlineSize: '7.5rem' }}>
              <strong style={{ fontSize: '0.85rem' }}>{tone}</strong>
              <p
                style={{
                  margin: '0.35rem 0 0',
                  color: 'var(--ms-color-fg-muted)',
                  fontSize: '0.78rem',
                }}
              >
                语义着色的信息卡
              </p>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--ms-color-fg-muted)' }}>
          padding 内边距档位
        </span>
        <div
          style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-start' }}
        >
          {PADDINGS.map((padding) => (
            <Card
              key={padding}
              variant="elevated"
              tone="primary"
              padding={padding}
              style={{ inlineSize: '9rem' }}
            >
              <strong style={{ fontSize: '0.85rem' }}>padding={padding}</strong>
              <p
                style={{
                  margin: '0.35rem 0 0',
                  color: 'var(--ms-color-fg-muted)',
                  fontSize: '0.78rem',
                }}
              >
                {padding === 'none'
                  ? '零留白,常用于整图 / 图表铺满卡片'
                  : '内容与边界的呼吸间距随此档变化'}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
