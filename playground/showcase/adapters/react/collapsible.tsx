import { Collapsible, type CollapsibleTone } from '@magic-scope/react';
import { type ComponentType, useEffect, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const initial = values.defaultOpen as boolean;
  const [open, setOpen] = useState(initial);

  // 「初始展开」旋钮变化时同步重置受控值,便于实时预览。
  useEffect(() => {
    setOpen(initial);
  }, [initial]);

  const label = (values.label as string) || '查看订单明细';

  return (
    <div style={{ inlineSize: 'min(360px, 100%)' }}>
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        tone={values.tone as CollapsibleTone}
        disabled={values.disabled as boolean}
      >
        <Collapsible.Trigger
          style={{
            display: 'flex',
            inlineSize: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.6rem 0.9rem',
            font: 'inherit',
            cursor: 'pointer',
            borderRadius: 'var(--ms-radius-md)',
            border: '1px solid var(--ms-color-border)',
            background: 'transparent',
            color: 'var(--ms-color-fg)',
          }}
        >
          <span>{label}</span>
          <span aria-hidden="true">{open ? '▲' : '▼'}</span>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <div style={{ padding: '0.75rem 0.9rem', color: 'var(--ms-color-fg-muted)' }}>
            商品小计 ¥ 298.00,运费 ¥ 0.00,优惠 -¥ 30.00,实付 ¥ 268.00。
          </div>
        </Collapsible.Content>
      </Collapsible>
    </div>
  );
}

const comps = import.meta.glob<{ default: ComponentType }>('./demos/collapsible/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/collapsible/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'collapsible',
  Playground,
  demos: buildDemos(comps, reactSources),
};
