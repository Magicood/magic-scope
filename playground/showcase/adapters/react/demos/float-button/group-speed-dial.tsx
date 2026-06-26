import { FloatButton } from '@magic-scope/react';

// 简易图标集,纯装饰。
function Glyph({ d }: { d: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}

// FloatButton.Group —— speed-dial 可展开菜单。
// Group 默认 position:fixed(贴视口右下);此处用相对定位的盒子 + 内联 position:absolute
// 把它锚定在展示区内,便于内联预览。点击触发钮展开,子项沿 direction 错峰弹出。
export default function Demo() {
  return (
    <div
      style={{
        position: 'relative',
        minBlockSize: '220px',
        inlineSize: '100%',
        border: '1px dashed var(--ms-color-border)',
        borderRadius: 'var(--ms-radius-lg)',
        padding: 'var(--ms-space-3)',
      }}
    >
      <span style={{ fontSize: '0.8rem', color: 'var(--ms-color-fg-muted)' }}>
        点击右下角主钮展开 / Esc 收起
      </span>
      <FloatButton.Group
        trigger="click"
        direction="up"
        tone="primary"
        tooltip="更多操作"
        right={16}
        bottom={16}
        style={{ position: 'absolute' }}
      >
        <FloatButton tone="info" icon={<Glyph d="M21 15l-5-5L5 21" />} aria-label="图片" />
        <FloatButton tone="success" icon={<Glyph d="M12 19V5M5 12l7-7 7 7" />} aria-label="上传" />
        <FloatButton tone="warning" icon={<Glyph d="M12 5v14M5 12h14" />} aria-label="新建" />
      </FloatButton.Group>
    </div>
  );
}
