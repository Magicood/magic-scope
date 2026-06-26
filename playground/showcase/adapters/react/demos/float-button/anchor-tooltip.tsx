import { FloatButton } from '@magic-scope/react';

// 问号图标,纯装饰。
function HelpIcon() {
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
      <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

// 多态 + tooltip:
//  - 传 href 渲染为 <a>(导航语义),_blank 自动补 rel="noopener noreferrer";
//  - 传 tooltip 自动用 Tooltip 包裹,hover / focus 弹出(浮钮默认朝左不出屏)。
export default function Demo() {
  return (
    <div
      style={{ display: 'flex', gap: 'var(--ms-space-6)', alignItems: 'center', flexWrap: 'wrap' }}
    >
      <FloatButton
        icon={<HelpIcon />}
        tooltip="查看帮助文档"
        tooltipPlacement="top"
        aria-label="帮助"
      />
      <FloatButton
        href="https://example.com/docs"
        target="_blank"
        icon={<HelpIcon />}
        tooltip="新标签打开文档"
        tooltipPlacement="top"
        type="primary"
        tone="info"
        aria-label="打开文档(新标签)"
      />
    </div>
  );
}
