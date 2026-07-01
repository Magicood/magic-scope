import { Command } from '@magic-scope/react';

// 内嵌命令面板:输入即过滤,↑↓ 移动、Enter 执行,组头不可选、命中字符高亮。
export default function Demo() {
  return (
    <Command
      style={{
        inlineSize: 'min(400px, 100%)',
        border: '1px solid var(--ms-color-border)',
        borderRadius: 'var(--ms-radius-lg)',
        overflow: 'hidden',
      }}
    >
      <Command.Input placeholder="搜索命令…" />
      <Command.List label="快捷命令">
        <Command.Item value="new">新建文件</Command.Item>
        <Command.Item value="open" keywords={['folder', '目录']}>
          打开文件夹
        </Command.Item>
        <Command.Item value="save">保存</Command.Item>
        <Command.Item value="close">关闭窗口</Command.Item>
        <Command.Empty>无匹配项</Command.Empty>
      </Command.List>
    </Command>
  );
}
