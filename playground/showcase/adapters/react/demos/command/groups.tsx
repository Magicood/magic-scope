import { Command } from '@magic-scope/react';
import { useState } from 'react';

// 分组 + 图标 + 快捷键提示 + separator,onSelect 拿到被执行命令的 value。
export default function Demo() {
  const [log, setLog] = useState<string>('');
  return (
    <div style={{ inlineSize: 'min(420px, 100%)' }}>
      <Command
        onSelect={(v) => setLog(`执行:${v}`)}
        style={{
          border: '1px solid var(--ms-color-border)',
          borderRadius: 'var(--ms-radius-lg)',
          overflow: 'hidden',
        }}
      >
        <Command.Input placeholder="Type a command…" icon="⌘" />
        <Command.List>
          <Command.Group heading="文件">
            <Command.Item value="new" icon="＋" shortcut="⌘N">
              新建
            </Command.Item>
            <Command.Item value="open" icon="⌘" shortcut="⌘O">
              打开
            </Command.Item>
          </Command.Group>
          <Command.Separator />
          <Command.Group heading="账户">
            <Command.Item value="profile" icon="◐">
              个人资料
            </Command.Item>
            <Command.Item value="logout" icon="⏻">
              退出登录
            </Command.Item>
          </Command.Group>
          <Command.Empty>没有命令匹配</Command.Empty>
        </Command.List>
      </Command>
      <small style={{ color: 'var(--ms-color-fg-muted)' }}>{log || '↑↓ 选择,Enter 执行'}</small>
    </div>
  );
}
