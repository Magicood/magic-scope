import { useState } from 'react';
import type { PopoverPlacement } from '../../../packages/react/src/index';
import { Button, Popover } from '../../../packages/react/src/index';
import type { ControlValues, DocEntry } from '../types';

function Demo({ values }: { values: ControlValues }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      placement={values.placement as PopoverPlacement}
      trigger={<Button variant="outline">{open ? '收起浮层 ✦' : '展开浮层 ✦'}</Button>}
    >
      <div style={{ maxWidth: '15rem', display: 'grid', gap: '0.5rem' }}>
        <strong style={{ fontSize: '0.9rem' }}>奥术浮层</strong>
        <p style={{ margin: 0, color: 'var(--ms-color-fg-muted)', fontSize: '0.85rem' }}>
          进 top-layer 的原生 Popover API,点外 / Esc 自动关闭;定位走 CSS Anchor
          Positioning,贴着触发器的「{values.placement}」方位弹出。
        </p>
        <Button size="sm" onClick={() => setOpen(false)}>
          知道了
        </Button>
      </div>
    </Popover>
  );
}

export const entry: DocEntry = {
  id: 'popover',
  name: 'Popover',
  category: 'overlay',
  summary: '点击浮层,基于原生 Popover API + CSS Anchor Positioning,贴合触发器四向弹出。',
  description:
    '自研、零依赖。浮层进 top-layer 用原生 Popover API(popover="auto" 自带点外 / Esc 关闭,无需 z-index 较劲)。\n定位用 CSS Anchor Positioning:trigger 注入唯一 anchor-name,浮层以 position-area 贴合 placement,并以 @supports 降级为 fixed 居中。\n支持受控(open + onOpenChange)与非受控两种用法,trigger 自动注入 aria-haspopup / aria-expanded / aria-controls。',
  controls: [
    {
      type: 'select',
      prop: 'placement',
      label: '方位 placement',
      default: 'bottom',
      options: [
        { value: 'top', label: 'top 上' },
        { value: 'bottom', label: 'bottom 下' },
        { value: 'left', label: 'left 左' },
        { value: 'right', label: 'right 右' },
      ],
    },
  ],
  render: (v) => <Demo values={v} />,
  usage: `import { Popover, Button } from '@magic-scope/react';

const [open, setOpen] = useState(false);
<Popover
  open={open}
  onOpenChange={setOpen}
  placement="bottom"
  trigger={<Button>展开</Button>}
>
  浮层内容…
</Popover>`,
  props: [
    {
      name: 'trigger',
      type: 'ReactElement',
      default: '—',
      description: '触发元素(单个 React 元素)。点击切换显隐;会被注入 anchor / aria 属性。',
    },
    { name: 'children', type: 'ReactNode', default: '—', description: '浮层内容。' },
    {
      name: 'placement',
      type: `'top' | 'bottom' | 'left' | 'right'`,
      default: `'bottom'`,
      description: '浮层相对 trigger 的方位。',
    },
    {
      name: 'open',
      type: 'boolean',
      default: '—',
      description: '受控:是否打开。传入即进入受控模式;不传则组件内部自管显隐。',
    },
    {
      name: 'onOpenChange',
      type: '(open: boolean) => void',
      default: '—',
      description: '显隐变化回调(受控 / 非受控均触发,含点外 / Esc 关闭)。',
    },
    {
      name: 'className',
      type: 'string',
      default: '—',
      description: '浮层附加 className。',
    },
  ],
  examples: [
    {
      title: '四向方位',
      description: '同一触发器,placement 决定浮层贴合的方向。',
      node: (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Popover placement="top" trigger={<Button variant="ghost">top</Button>}>
            上方浮层
          </Popover>
          <Popover placement="bottom" trigger={<Button variant="ghost">bottom</Button>}>
            下方浮层
          </Popover>
          <Popover placement="left" trigger={<Button variant="ghost">left</Button>}>
            左侧浮层
          </Popover>
          <Popover placement="right" trigger={<Button variant="ghost">right</Button>}>
            右侧浮层
          </Popover>
        </div>
      ),
    },
  ],
};
