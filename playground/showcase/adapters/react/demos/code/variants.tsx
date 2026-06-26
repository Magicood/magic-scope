import { Code } from '@magic-scope/react';

// 四变体 × 语义 tone:配色全走全库 tone resolver,只读 6 槽位,零硬编码。
const variants = ['solid', 'soft', 'outline', 'ghost'] as const;
const tones = ['primary', 'accent', 'success', 'warning', 'danger', 'info', 'neutral'] as const;

export default function Demo() {
  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      {variants.map((variant) => (
        <div
          key={variant}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}
        >
          <span
            style={{ inlineSize: '4rem', color: 'var(--ms-color-fg-muted)', fontSize: '0.8rem' }}
          >
            {variant}
          </span>
          {tones.map((tone) => (
            <Code key={tone} variant={variant} tone={tone}>
              {tone}
            </Code>
          ))}
        </div>
      ))}
    </div>
  );
}
