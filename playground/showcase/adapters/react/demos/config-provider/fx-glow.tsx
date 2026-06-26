import { Button, type ConfigFx, ConfigProvider } from '@magic-scope/react';

const LEVELS: { key: ConfigFx; label: string }[] = [
  { key: 'on', label: 'fx="on" 满发光' },
  { key: 'subtle', label: 'fx="subtle" 克制' },
  { key: 'off', label: 'fx="off" 无发光' },
];

export default function Demo() {
  // fx → data-ms-fx 装饰发光总闸。off 时装饰发光消失,但聚焦环(可达性)不受影响。
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-4)' }}>
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        悬停按钮看发光衰减;聚焦环不随 fx 关闭(无障碍保留)
      </small>
      <div style={{ display: 'flex', gap: 'var(--ms-space-4)', flexWrap: 'wrap' }}>
        {LEVELS.map(({ key, label }) => (
          <ConfigProvider
            key={key}
            fx={key}
            style={{
              padding: 'var(--ms-space-4)',
              borderRadius: 'var(--ms-radius-md)',
              border: '1px solid var(--ms-color-border)',
            }}
          >
            <Button tone="primary" glow="always">
              {label}
            </Button>
          </ConfigProvider>
        ))}
      </div>
    </div>
  );
}
