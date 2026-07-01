import { Button, Dropdown } from '@magic-scope/react';

// hover 触发的时序与间距:
// - triggerAction="hover" 让指针悬停即展开
// - closeDelay 让指针离开后延迟 250ms 再收起,给「触发器 → 面板」滑动留出缓冲,避免瞬间闪断
// - offset 拉开触发器与浮层之间的距离,配合 arrow 让指向更清晰
export default function Demo() {
  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '1rem 0' }}>
      <Dropdown
        triggerAction="hover"
        closeDelay={250}
        offset={14}
        arrow
        trigger={<Button variant="soft">悬停展开(慢收) ▾</Button>}
        items={[
          { label: '个人资料', onSelect: () => {} },
          { label: '账单设置', onSelect: () => {} },
          { type: 'separator' },
          { label: '退出登录', danger: true, onSelect: () => {} },
        ]}
      />

      <Dropdown
        triggerAction="hover"
        closeDelay={0}
        offset={4}
        trigger={<Button variant="outline">悬停展开(即收) ▾</Button>}
        items={[
          { label: '复制链接', onSelect: () => {} },
          { label: '嵌入代码', onSelect: () => {} },
        ]}
      />
    </div>
  );
}
