import type { TabItem } from '@magic-scope/react';
import { Tabs } from '@magic-scope/react';

// orientation="vertical":竖排标签,indicator 沿块向滑动,方向键改为 ↑ / ↓。
// 同时演示 icon 前置图标与 badge 后置徽标签名特性。
const items: TabItem[] = [
  {
    value: 'overview',
    label: 'Overview 概览',
    icon: <span aria-hidden="true">✦</span>,
    content: (
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
        概览汇总进度与关键指标。竖排时 indicator 沿块向(上下)平滑滑动,焦点在标签上时按 ↑ / ↓ 切换。
      </p>
    ),
  },
  {
    value: 'inbox',
    label: 'Inbox 收件箱',
    icon: <span aria-hidden="true">❄</span>,
    badge: <span>3</span>,
    content: (
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
        收件箱集中待办与通知,badge 徽标可承载未读数等附加信息。
      </p>
    ),
  },
  {
    value: 'settings',
    label: 'Settings 设置',
    icon: <span aria-hidden="true">✸</span>,
    content: (
      <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)' }}>
        设置区集中权限、通知与集成配置,改动即时保存。
      </p>
    ),
  },
];

export default function Demo() {
  return (
    <div style={{ inlineSize: 'min(36rem, 100%)' }}>
      <Tabs items={items} defaultValue="overview" orientation="vertical" tone="info" />
    </div>
  );
}
