import { useState } from 'react';
import { Button, Dialog } from '../../../packages/react/src/index';
import type { ControlValues, DocEntry } from '../types';

function Demo({ values }: { values: ControlValues }) {
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
          {values.dismissable ? '点遮罩可关闭。' : '已关闭点遮罩关闭,只能按按钮。'}
        </p>
        <Button onClick={() => setOpen(false)}>知道了</Button>
      </Dialog>
    </>
  );
}

export const entry: DocEntry = {
  id: 'dialog',
  name: 'Dialog',
  category: 'overlay',
  summary: '模态对话框,基于原生 <dialog> + showModal(),自带焦点陷阱与 top-layer。',
  description:
    '原生 <dialog> 提供焦点陷阱、Esc 关闭、::backdrop 遮罩、top-layer(永远最上,无需 z-index)。自研封装受控 open、点遮罩关闭、@starting-style 入场动画(受顶栏动效开关控制)。',
  controls: [
    { type: 'boolean', prop: 'dismissable', label: '点遮罩关闭 dismissable', default: true },
  ],
  render: (v) => <Demo values={v} />,
  usage: `import { Dialog, Button } from '@magic-scope/react';

const [open, setOpen] = useState(false);
<Button onClick={() => setOpen(true)}>打开</Button>
<Dialog open={open} onClose={() => setOpen(false)}>…</Dialog>`,
  props: [
    { name: 'open', type: 'boolean', default: '—', description: '是否打开(受控,必填)。' },
    {
      name: 'onClose',
      type: '() => void',
      default: '—',
      description: '关闭回调(Esc / 点遮罩 / 关闭按钮)。',
    },
    {
      name: 'dismissable',
      type: 'boolean',
      default: 'true',
      description: '点击遮罩是否关闭。',
    },
    { name: 'children', type: 'ReactNode', default: '—', description: '对话框内容。' },
  ],
};
