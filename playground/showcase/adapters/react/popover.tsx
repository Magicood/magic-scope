import type { PopoverPlacement } from '@magic-scope/react';
import { Button, Popover } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      placement={values.placement as PopoverPlacement}
      trigger={<Button variant="outline">{open ? '收起浮层 ✦' : '展开浮层 ✦'}</Button>}
    >
      <div style={{ display: 'grid', gap: '0.5rem', maxInlineSize: '15rem' }}>
        <strong style={{ fontSize: '0.9rem' }}>概览浮层</strong>
        <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
          进 top-layer 的原生 Popover API,点外 / Esc 自动关闭;定位走 CSS Anchor
          Positioning,贴着触发器的「{values.placement as string}」方位弹出。
        </p>
        <Button size="sm" onClick={() => setOpen(false)}>
          知道了
        </Button>
      </div>
    </Popover>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/popover/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/popover/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'popover',
  Playground,
  demos: buildDemos(comps, reactSources),
};
