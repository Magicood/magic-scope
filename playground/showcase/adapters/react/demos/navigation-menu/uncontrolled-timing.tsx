import { NavigationMenu } from '@magic-scope/react';

// 非受控 + hover 时序 + 浮层间距:
// - defaultValue 让「学习」面板初始即展开(非受控,后续交互自行接管)
// - closeDelay 让指针离开后延迟 300ms 再收起,方便从触发器滑入面板不闪断
// - offset 拉开触发条与浮层之间的距离
// 其中「已下线」触发器用 disabled 关掉交互,验证禁用态触发器不响应 hover / 点击。
export default function Demo() {
  return (
    <div style={{ minBlockSize: '260px' }}>
      <NavigationMenu
        tone="accent"
        aria-label="产品导航(非受控)"
        defaultValue="learn"
        closeDelay={300}
        offset={12}
      >
        <NavigationMenu.List>
          <NavigationMenu.Item value="learn">
            <NavigationMenu.Trigger value="learn">学习</NavigationMenu.Trigger>
            <NavigationMenu.Content value="learn">
              <div
                style={{
                  display: 'grid',
                  gap: '0.4rem',
                  padding: '0.75rem',
                  maxInlineSize: '300px',
                }}
              >
                <strong>从零上手</strong>
                <NavigationMenu.Link href="#tutorial">交互式教程 →</NavigationMenu.Link>
                <NavigationMenu.Link href="#examples">示例画廊 →</NavigationMenu.Link>
              </div>
            </NavigationMenu.Content>
          </NavigationMenu.Item>

          <NavigationMenu.Item value="community">
            <NavigationMenu.Trigger value="community">社区</NavigationMenu.Trigger>
            <NavigationMenu.Content value="community">
              <div
                style={{
                  display: 'grid',
                  gap: '0.4rem',
                  padding: '0.75rem',
                  maxInlineSize: '300px',
                }}
              >
                <NavigationMenu.Link href="#forum">论坛 →</NavigationMenu.Link>
                <NavigationMenu.Link href="#discord">Discord →</NavigationMenu.Link>
              </div>
            </NavigationMenu.Content>
          </NavigationMenu.Item>

          <NavigationMenu.Item value="legacy">
            <NavigationMenu.Trigger value="legacy" disabled>
              已下线(disabled)
            </NavigationMenu.Trigger>
            <NavigationMenu.Content value="legacy">
              <div style={{ padding: '0.75rem' }}>不可达 —— 触发器已禁用。</div>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu>
    </div>
  );
}
