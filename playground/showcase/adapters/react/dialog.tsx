import { Button, Dialog } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开 Dialog</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        dismissable={values.dismissable as boolean}
      >
        <h3 style={{ marginBlockStart: 0 }}>奥术对话框</h3>
        <p style={{ color: 'var(--ms-color-fg-muted)' }}>
          原生 &lt;dialog&gt; + showModal():焦点陷阱、Esc、::backdrop 遮罩、入场动画。
          {values.dismissable ? '点遮罩可关闭。' : '已禁用点遮罩关闭,只能按按钮。'}
        </p>
        <Button onClick={() => setOpen(false)}>知道了</Button>
      </Dialog>
    </>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/dialog/*.tsx', { eager: true });
const reactSources = import.meta.glob<string>('./demos/dialog/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'dialog',
  Playground,
  demos: buildDemos(comps, reactSources),
};
