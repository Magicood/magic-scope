import { FloatButton } from '@magic-scope/react';

// 铃铛图标,纯装饰。
function BellIcon() {
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
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

// 角标 badge:数字(>0 显示)/ 超 overflowCount 截为 N+ / { dot:true } 小红点。
// badge 作纯视觉装饰(aria-hidden);计数语义应进 aria-label,避免读屏念孤立数字。
export default function Demo() {
  return (
    <div
      style={{ display: 'flex', gap: 'var(--ms-space-6)', alignItems: 'center', flexWrap: 'wrap' }}
    >
      <FloatButton icon={<BellIcon />} badge={5} tone="danger" aria-label="通知,5 条未读" />
      <FloatButton
        icon={<BellIcon />}
        badge={{ count: 240, overflowCount: 99 }}
        tone="danger"
        aria-label="通知,99+ 条未读"
      />
      <FloatButton icon={<BellIcon />} badge={{ dot: true }} aria-label="通知,有新消息" />
      <FloatButton
        shape="square"
        icon={<BellIcon />}
        description="消息"
        badge={12}
        type="primary"
        tone="info"
        aria-label="消息,12 条未读"
      />
    </div>
  );
}
