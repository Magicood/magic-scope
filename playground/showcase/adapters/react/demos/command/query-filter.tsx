import { Command } from '@magic-scope/react';

// defaultValue 预置初始查询串;filter 自定义匹配(覆盖内置 substring / fuzzy);
// Command.Item disabled 禁用某条命令(不可选中、不参与键盘导航)。
export default function Demo() {
  return (
    <Command
      defaultValue="new"
      filter={(value, search) => value.toLowerCase().includes(search.toLowerCase())}
      style={{
        border: '1px solid var(--ms-color-border)',
        borderRadius: 'var(--ms-radius-lg)',
        overflow: 'hidden',
        inlineSize: 'min(420px, 100%)',
      }}
    >
      <Command.Input placeholder="自定义 filter 匹配…" />
      <Command.List>
        <Command.Item value="new-file">新建文件</Command.Item>
        <Command.Item value="new-folder">新建文件夹</Command.Item>
        <Command.Item value="archived-project" disabled>
          已归档项目(禁用)
        </Command.Item>
        <Command.Empty>无匹配命令</Command.Empty>
      </Command.List>
    </Command>
  );
}
