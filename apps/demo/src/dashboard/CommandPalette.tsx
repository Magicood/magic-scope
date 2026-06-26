import { Command } from '@magic-scope/react';
import { navigate } from '../lib/router';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (view: string) => void;
  onOpenSettings: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
  onOpenSettings,
}: CommandPaletteProps) {
  const run = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  return (
    <Command.Dialog open={open} onOpenChange={onOpenChange} hotkey>
      <Command.Input placeholder="搜索指标、事件或跳转…" />
      <Command.List>
        <Command.Group heading="导航">
          <Command.Item value="概览 overview" onSelect={() => run(() => onNavigate('overview'))}>
            概览
          </Command.Item>
          <Command.Item value="事件流 events" onSelect={() => run(() => onNavigate('events'))}>
            事件流
          </Command.Item>
          <Command.Item value="团队 team" onSelect={() => run(() => onNavigate('team'))}>
            团队成员
          </Command.Item>
        </Command.Group>

        <Command.Group heading="操作">
          <Command.Item value="外观设置 theme settings" onSelect={() => run(onOpenSettings)}>
            外观设置 · 切换主题
          </Command.Item>
          <Command.Item value="新建看板 dashboard" onSelect={() => run(() => undefined)}>
            新建看板
          </Command.Item>
          <Command.Item value="返回官网 home" onSelect={() => run(() => navigate('/'))}>
            返回官网
          </Command.Item>
        </Command.Group>

        <Command.Empty>没有匹配的结果</Command.Empty>
      </Command.List>
    </Command.Dialog>
  );
}
