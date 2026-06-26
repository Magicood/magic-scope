import type { DrawerSide, DrawerSize, DrawerTone } from '@magic-scope/react';
import { Button, Drawer } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const [open, setOpen] = useState(false);
  const side = values.side as DrawerSide;
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开 Drawer</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side={side}
        size={values.size as DrawerSize}
        tone={values.tone as DrawerTone}
        title={(values.title as string) || undefined}
        dismissable={values.dismissable as boolean}
      >
        <p style={{ marginBlockStart: 0, color: 'var(--ms-color-fg-muted)' }}>
          从 <code>{side}</code> 边滑入的侧边抽屉:焦点陷阱、Esc 关闭、::backdrop 遮罩、top-layer,
          并锁背景滚动、避让安全区。
        </p>
        <p style={{ color: 'var(--ms-color-fg-muted)' }}>
          {values.dismissable ? '点遮罩可关闭。' : '已关闭点遮罩,只能按按钮或 Esc。'}
        </p>
        <Button onClick={() => setOpen(false)}>收起</Button>
      </Drawer>
    </>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/drawer/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/drawer/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'drawer',
  Playground,
  demos: buildDemos(comps, reactSources),
};
