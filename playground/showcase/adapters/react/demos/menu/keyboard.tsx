import { Button, Menu } from '@magic-scope/react';

// 多项菜单 + 中间穿插禁用项,用来体验真实键盘导航:
// 打开即聚焦首个可用项,↑↓ 跳过 disabled,Home / End 跳首尾,
// Enter / Space 触发并关闭,Esc / Tab 收起。
export default function Demo() {
  return (
    <Menu
      trigger={<Button variant="outline">操作 ▾(用方向键试试)</Button>}
      items={[
        { label: '概览 Overview', onSelect: () => {} },
        { label: '活动 Activity', onSelect: () => {} },
        { label: '计费 Billing(禁用)', onSelect: () => {}, disabled: true },
        { label: '成员 Members', onSelect: () => {} },
        { label: '集成 Integrations', onSelect: () => {} },
        { label: '设置 Settings', onSelect: () => {} },
      ]}
    />
  );
}
