import { Button, Dialog } from '@magic-scope/react';
import { useState } from 'react';

// 旗舰深度:Header / Title / Description / Body / Footer 子部件自动挂 id,
// 根 <dialog> 据此关联 aria-labelledby / aria-describedby。hideCloseButton 隐藏内建关闭按钮、
// 自定义头部时用;onOpenChange 双通道与受控 open 配合,集中处理开合副作用。
export default function Demo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>查看升级条款</Button>
      <Dialog
        open={open}
        size="lg"
        tone="info"
        hideCloseButton
        onOpenChange={setOpen}
        dismissable={false}
      >
        <Dialog.Header>
          <Dialog.Title>奥术核心 v2 升级</Dialog.Title>
          <Dialog.Description>隐藏了内建关闭按钮,只能通过底部明确操作离开。</Dialog.Description>
        </Dialog.Header>
        <Dialog.Body>
          <p style={{ marginBlockStart: 0, color: 'var(--ms-color-fg-muted)' }}>
            升级后法术编译流水线将全量切换到新内核,旧符文缓存会被清空并重建。
          </p>
          <ul style={{ color: 'var(--ms-color-fg-muted)', paddingInlineStart: '1.25rem' }}>
            <li>动效参数全部可热切换</li>
            <li>光影辉光随 tone 槽位派生</li>
            <li>焦点陷阱与 top-layer 由原生 dialog 托管</li>
          </ul>
        </Dialog.Body>
        <Dialog.Footer>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            稍后再说
          </Button>
          <Button tone="info" onClick={() => setOpen(false)}>
            立即升级
          </Button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}
