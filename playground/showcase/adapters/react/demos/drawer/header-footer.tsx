import { Badge, Button, Drawer } from '@magic-scope/react';
import { useState } from 'react';

// header 整块覆盖默认标题、自定义富头部布局;footer 固定底栏(安全区避让)放主/次操作;
// hideCloseButton 隐藏内建关闭钮 —— 头部已自带关闭入口时改由底栏与头部按钮收口。
export default function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开富头部 + 底栏抽屉</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        tone="accent"
        size="lg"
        hideCloseButton
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <strong style={{ fontSize: '1.05rem' }}>法术配置</strong>
            <Badge tone="accent" variant="soft">
              草稿
            </Badge>
          </div>
        }
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button tone="accent" onClick={() => setOpen(false)}>
              保存配置
            </Button>
          </div>
        }
      >
        <p style={{ marginBlockStart: 0, color: 'var(--ms-color-fg-muted)' }}>
          header 传入整块自定义头部(覆盖默认标题);footer 渲染固定底栏并避让安全区; hideCloseButton
          隐藏内建关闭按钮,关闭由底栏操作收口。
        </p>
        <p style={{ color: 'var(--ms-color-fg-muted)' }}>
          正文区独立滚动,头部与底栏始终贴边可达,适合带主/次操作的表单类抽屉。
        </p>
      </Drawer>
    </>
  );
}
