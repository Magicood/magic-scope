import { Command, type CommandFilterMode, type CommandTone } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const [picked, setPicked] = useState('(尚未执行)');

  return (
    <div style={{ inlineSize: 'min(420px, 100%)' }}>
      <Command
        tone={values.tone as CommandTone}
        filterMode={values.filterMode as CommandFilterMode}
        shouldFilter={values.shouldFilter as boolean}
        loop={values.loop as boolean}
        onSelect={setPicked}
        style={{
          border: '1px solid var(--ms-color-border)',
          borderRadius: 'var(--ms-radius-lg)',
          overflow: 'hidden',
        }}
      >
        <Command.Input placeholder="输入命令…" icon="⌘" />
        <Command.List label="命令">
          <Command.Group heading="导航">
            <Command.Item value="home" icon="⌂" keywords={['首页', 'index']}>
              前往首页
            </Command.Item>
            <Command.Item value="settings" icon="⚙" shortcut="⌘,">
              打开设置
            </Command.Item>
          </Command.Group>
          <Command.Group heading="操作">
            <Command.Item value="new-doc" icon="＋" shortcut="⌘N">
              新建文档
            </Command.Item>
            <Command.Item value="archive" disabled>
              归档(禁用)
            </Command.Item>
          </Command.Group>
          <Command.Empty>无匹配命令</Command.Empty>
        </Command.List>
      </Command>
      <p style={{ margin: '0.5rem 0 0', color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
        上次执行:{picked}
      </p>
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/command/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/command/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'command',
  Playground,
  demos: buildDemos(comps, reactSources),
};
