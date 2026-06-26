import { Button, ConfigProvider, Input } from '@magic-scope/react';

const box = {
  display: 'grid',
  gap: 'var(--ms-space-3)',
  padding: 'var(--ms-space-4)',
  borderRadius: 'var(--ms-radius-md)',
  border: '1px solid var(--ms-color-border)',
} as const;

export default function Demo() {
  // 可嵌套就近覆盖、可只设部分开关:内层只改 density,tone 继承外层(spacious 不重设)。
  return (
    <ConfigProvider density="spacious" tone="info" style={box}>
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>外层:density=spacious · tone=info</small>
      <div
        style={{
          display: 'flex',
          gap: 'var(--ms-space-3)',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Button tone="info">外层按钮</Button>
        <Input placeholder="外层输入" style={{ inlineSize: '10rem' }} />
      </div>

      <ConfigProvider density="compact" style={{ ...box, background: 'var(--ms-color-bg-subtle)' }}>
        <small style={{ color: 'var(--ms-color-fg-muted)' }}>
          内层:只覆盖 density=compact —— tone=info 继承外层
        </small>
        <div
          style={{
            display: 'flex',
            gap: 'var(--ms-space-3)',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button tone="info">内层按钮(更紧凑)</Button>
          <Input placeholder="内层输入" style={{ inlineSize: '10rem' }} />
        </div>
      </ConfigProvider>
    </ConfigProvider>
  );
}
