import { useState } from 'react';
import type { DrawerSide } from '../../../packages/react/src/index';
import { Button, Drawer } from '../../../packages/react/src/index';
import type { ControlValues, DocEntry } from '../types';

function Demo({ values }: { values: ControlValues }) {
  const [open, setOpen] = useState(false);
  const side = values.side as DrawerSide;
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开 Drawer</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side={side}
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

export const entry: DocEntry = {
  id: 'drawer',
  name: 'Drawer',
  category: 'overlay',
  summary: '侧边抽屉,基于原生 <dialog> + showModal(),支持四向滑入与焦点陷阱。',
  description:
    '原生 <dialog> 提供焦点陷阱、Esc 关闭、::backdrop 遮罩、top-layer(永远最上,无需 z-index)。自研封装受控 open、四个方向滑入(start/end/top/bottom)、点遮罩关闭、内建关闭按钮、锁背景滚动、安全区避让,并尊重 reduced-motion(入场动画受顶栏动效开关控制)。',
  controls: [
    {
      type: 'select',
      prop: 'side',
      label: '滑入边 side',
      default: 'end',
      options: [
        { value: 'start', label: 'start 左' },
        { value: 'end', label: 'end 右' },
        { value: 'top', label: 'top 上' },
        { value: 'bottom', label: 'bottom 下' },
      ],
    },
    { type: 'text', prop: 'title', label: '标题 title', default: '奥术抽屉' },
    { type: 'boolean', prop: 'dismissable', label: '点遮罩关闭 dismissable', default: true },
  ],
  render: (v) => <Demo values={v} />,
  usage: `import { Drawer, Button } from '@magic-scope/react';

const [open, setOpen] = useState(false);
<Button onClick={() => setOpen(true)}>打开</Button>
<Drawer open={open} onClose={() => setOpen(false)} side="end" title="设置">…</Drawer>`,
  props: [
    { name: 'open', type: 'boolean', default: '—', description: '是否打开(受控,必填)。' },
    {
      name: 'onClose',
      type: '() => void',
      default: '—',
      description: '关闭回调(Esc / 点遮罩 / 关闭按钮)。',
    },
    {
      name: 'side',
      type: `'start' | 'end' | 'top' | 'bottom'`,
      default: `'end'`,
      description: '滑入边:start(左)/ end(右)/ top(上)/ bottom(下)。',
    },
    {
      name: 'title',
      type: 'ReactNode',
      default: '—',
      description: '标题;设置后渲染头部并与抽屉 aria-labelledby 关联。',
    },
    {
      name: 'dismissable',
      type: 'boolean',
      default: 'true',
      description: '点击遮罩是否关闭。',
    },
    { name: 'children', type: 'ReactNode', default: '—', description: '抽屉内容。' },
    {
      name: '...props',
      type: `ComponentPropsWithoutRef<'dialog'>`,
      default: '—',
      description: '透传原生 dialog 属性(排除 open / title)。',
    },
  ],
  examples: [
    {
      title: '无标题(浮动关闭按钮)',
      description: '不传 title 时,右上角渲染一个浮动的关闭按钮。',
      node: (
        <Drawer open={false} onClose={() => {}} side="end">
          抽屉内容
        </Drawer>
      ),
    },
  ],
};
