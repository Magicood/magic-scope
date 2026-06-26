import { Button, ConfigProvider, Input } from '@magic-scope/react';

export default function Demo() {
  // ConfigProvider 本身无视觉形态:在一处把全局开关设好,被包裹的子树自动读祖先 data-ms-* 生效。
  return (
    <ConfigProvider
      density="comfortable"
      tone="accent"
      style={{
        display: 'grid',
        gap: 'var(--ms-space-4)',
        padding: 'var(--ms-space-5)',
        borderRadius: 'var(--ms-radius-lg)',
        border: '1px solid var(--ms-color-border)',
        background: 'var(--ms-color-bg-subtle)',
      }}
    >
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>
        density=&quot;comfortable&quot; · tone=&quot;accent&quot; —— 下面控件无需各自传 tone
      </small>
      <div style={{ display: 'flex', gap: 'var(--ms-space-3)', flexWrap: 'wrap' }}>
        <Button tone="accent">主操作</Button>
        <Button tone="accent" variant="soft">
          次操作
        </Button>
      </div>
      <Input tone="accent" placeholder="搜索…" />
    </ConfigProvider>
  );
}
