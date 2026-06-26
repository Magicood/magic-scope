import { Button, ConfigProvider } from '@magic-scope/react';

export default function Demo() {
  // 留口:as 换多态根标签(语义场景用 section);asChild 走 Slot,把 data-ms-* 合并到已有节点不多包一层 div。
  return (
    <div style={{ display: 'grid', gap: 'var(--ms-space-4)' }}>
      {/* as:渲染为 <section>,density 落到该 section */}
      <ConfigProvider
        as="section"
        density="compact"
        aria-label="紧凑工具区"
        style={{
          display: 'flex',
          gap: 'var(--ms-space-3)',
          padding: 'var(--ms-space-4)',
          borderRadius: 'var(--ms-radius-md)',
          border: '1px solid var(--ms-color-border)',
        }}
      >
        <small style={{ color: 'var(--ms-color-fg-muted)' }}>
          as=&quot;section&quot;(根为语义标签)
        </small>
        <Button tone="primary" size="sm">
          紧凑按钮
        </Button>
      </ConfigProvider>

      {/* asChild:不额外包 div,把 data-ms-density 直接挂到下面这个已有容器上 */}
      <ConfigProvider asChild density="spacious" tone="success">
        <div
          style={{
            display: 'flex',
            gap: 'var(--ms-space-3)',
            alignItems: 'center',
            padding: 'var(--ms-space-4)',
            borderRadius: 'var(--ms-radius-md)',
            border: '1px dashed var(--ms-color-border)',
          }}
        >
          <small style={{ color: 'var(--ms-color-fg-muted)' }}>
            asChild —— 开关挂到这个已有容器,DOM 不多一层
          </small>
          <Button tone="success">宽松按钮</Button>
        </div>
      </ConfigProvider>
    </div>
  );
}
