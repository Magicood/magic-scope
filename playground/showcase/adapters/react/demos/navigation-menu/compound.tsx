import { NavigationMenu } from '@magic-scope/react';

// 复合用法(children):自绘 panel 内容(mega-menu 富卡片),
// List / Item / Trigger / Content / Link / Viewport 完全掌控结构。
export default function Demo() {
  return (
    <div style={{ minBlockSize: '240px' }}>
      <NavigationMenu tone="accent" aria-label="产品导航">
        <NavigationMenu.List>
          <NavigationMenu.Item value="platform">
            <NavigationMenu.Trigger value="platform">平台</NavigationMenu.Trigger>
            <NavigationMenu.Content value="platform">
              <div
                style={{
                  display: 'grid',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  maxInlineSize: '320px',
                }}
              >
                <strong>Magic Scope 平台</strong>
                <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
                  一套可追溯、可搜索的多框架组件流水线。
                </p>
                <NavigationMenu.Link href="#start">快速开始 →</NavigationMenu.Link>
              </div>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
          <NavigationMenu.Item value="docs">
            <NavigationMenu.Link href="#docs" asTrigger value="docs">
              文档
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu>
    </div>
  );
}
