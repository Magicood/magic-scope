import type { TabItem } from '@magic-scope/react';
import { Tabs } from '@magic-scope/react';

const items: TabItem[] = [
  {
    value: 'overview',
    label: 'Overview 概览',
    content: <p style={{ margin: 0 }}>概览:进度、成员与关键指标一览。</p>,
  },
  {
    value: 'activity',
    label: 'Activity 活动',
    content: <p style={{ margin: 0 }}>活动:最近的变更与评论。</p>,
  },
  {
    value: 'settings',
    label: 'Settings 设置',
    content: <p style={{ margin: 0 }}>设置:偏好、通知与权限。</p>,
  },
];

export default function Demo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', inlineSize: '100%' }}>
      <Tabs items={items} defaultValue="overview" variant="underline" />
      <Tabs items={items} defaultValue="overview" variant="pill" />
    </div>
  );
}
