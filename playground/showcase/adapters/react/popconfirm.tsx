import type { PopoverPlacement } from '@magic-scope/react';
import { Button, Popconfirm } from '@magic-scope/react';
import { type ComponentType, useState } from 'react';
import { buildDemos } from '../../core/collectDemos';
import type { ReactAdapter } from '../../core/types';
import type { ControlValues } from '../../types';

function Playground({ values }: { values: ControlValues }) {
  const [result, setResult] = useState<'idle' | 'confirmed' | 'cancelled'>('idle');
  const variant = values.variant as 'default' | 'danger';
  const tip =
    result === 'confirmed'
      ? '已确认 ✓'
      : result === 'cancelled'
        ? '已取消(取消 / 点外 / Esc)'
        : '点按钮试试,会反馈你的选择';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
      <Popconfirm
        trigger={
          <Button variant={variant === 'danger' ? 'outline' : 'solid'}>
            {variant === 'danger' ? '删除条目' : '提交审核'}
          </Button>
        }
        title={values.title as string}
        description={values.description as string}
        confirmText={values.confirmText as string}
        cancelText={values.cancelText as string}
        variant={variant}
        placement={values.placement as PopoverPlacement}
        onConfirm={() => setResult('confirmed')}
        onCancel={() => setResult('cancelled')}
      />
      <span style={{ color: 'var(--ms-color-fg-muted)', fontSize: '0.875rem' }}>{tip}</span>
    </div>
  );
}

// 真实 demo 文件：同一文件既 import 渲染、又 ?raw 取源码（永不漂移）。
const comps = import.meta.glob<{ default: ComponentType }>('./demos/popconfirm/*.tsx', {
  eager: true,
});
const reactSources = import.meta.glob<string>('./demos/popconfirm/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const adapter: ReactAdapter = {
  id: 'popconfirm',
  Playground,
  demos: buildDemos(comps, reactSources),
};
