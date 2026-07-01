import { Button, Command } from '@magic-scope/react';
import { useState } from 'react';

// Command.Dialog:包进模态对话框,按钮或 ⌘K / Ctrl+K(hotkey)唤起,复用 Dialog 焦点陷阱与 Esc。
export default function Demo() {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState('(未执行)');

  return (
    <div style={{ display: 'grid', gap: '0.6rem', justifyItems: 'start' }}>
      <Button variant="outline" onClick={() => setOpen(true)}>
        打开命令面板 <kbd style={{ marginInlineStart: '0.4rem' }}>⌘K</kbd>
      </Button>
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        hotkey
        onSelect={(v) => {
          setPicked(v);
          setOpen(false);
        }}
      >
        <Command.Input placeholder="输入命令,或按 Esc 关闭…" />
        <Command.List label="全局命令">
          <Command.Group heading="跳转">
            <Command.Item value="dashboard">仪表盘</Command.Item>
            <Command.Item value="orders">订单</Command.Item>
            <Command.Item value="settings">设置</Command.Item>
          </Command.Group>
          <Command.Empty>无匹配</Command.Empty>
        </Command.List>
      </Command.Dialog>
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>上次执行:{picked}</small>
    </div>
  );
}
