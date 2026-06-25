import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'dialog',
  name: 'Dialog',
  category: 'overlay',
  summary: '模态对话框,基于原生 <dialog> + showModal(),自带焦点陷阱与 top-layer。',
  description:
    '原生 <dialog> 提供焦点陷阱、Esc 关闭、::backdrop 遮罩、top-layer(永远最上,无需 z-index)。自研封装受控 open、点遮罩关闭、@starting-style 入场动画(受顶栏动效开关控制)。',
  controls: [
    { type: 'boolean', prop: 'dismissable', label: '点遮罩关闭 dismissable', default: true },
  ],
};
