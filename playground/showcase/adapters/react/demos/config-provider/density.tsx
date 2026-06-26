import { Button, type ConfigDensity, ConfigProvider, Input } from '@magic-scope/react';

const DENSITIES: { key: ConfigDensity; label: string }[] = [
  { key: 'compact', label: 'compact 紧凑' },
  { key: 'comfortable', label: 'comfortable 舒适(基线)' },
  { key: 'spacious', label: 'spacious 宽松' },
];

export default function Demo() {
  // density → data-ms-density,沿级联缩放控件高度与间距。三块并排对比同一组控件。
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-4)' }}>
      {DENSITIES.map(({ key, label }) => (
        <ConfigProvider
          key={key}
          density={key}
          style={{
            display: 'grid',
            gap: 'var(--ms-space-3)',
            padding: 'var(--ms-space-4)',
            borderRadius: 'var(--ms-radius-md)',
            border: '1px solid var(--ms-color-border)',
          }}
        >
          <small style={{ color: 'var(--ms-color-fg-muted)' }}>{label}</small>
          <div
            style={{
              display: 'flex',
              gap: 'var(--ms-space-3)',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button tone="primary">按钮</Button>
            <Input placeholder="输入框" style={{ inlineSize: '12rem' }} />
          </div>
        </ConfigProvider>
      ))}
    </div>
  );
}
