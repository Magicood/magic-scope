import { Button, Menu } from '@magic-scope/react';

// 多项菜单 + 中间穿插禁用项,用来体验真实键盘导航:
// 打开即聚焦首个可用项,↑↓ 跳过 disabled,Home / End 跳首尾,
// Enter / Space 触发并关闭,Esc / Tab 收起。
export default function Demo() {
  return (
    <Menu
      trigger={<Button variant="outline">学派 ▾(用方向键试试)</Button>}
      items={[
        { label: '塑能 Evocation', onSelect: () => {} },
        { label: '咒法 Conjuration', onSelect: () => {} },
        { label: '惑控 Enchantment(禁用)', onSelect: () => {}, disabled: true },
        { label: '幻术 Illusion', onSelect: () => {} },
        { label: '死灵 Necromancy', onSelect: () => {} },
        { label: '变化 Transmutation', onSelect: () => {} },
      ]}
    />
  );
}
