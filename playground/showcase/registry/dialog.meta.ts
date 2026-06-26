import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'dialog',
  name: 'Dialog',
  category: 'overlay',
  summary: '模态对话框,基于原生 <dialog> + showModal(),自带焦点陷阱与 top-layer。',
  description:
    '原生 <dialog> 提供焦点陷阱、Esc 关闭、::backdrop 遮罩、top-layer(永远最上,无需 z-index)。自研封装受控 open、点遮罩关闭、@starting-style 入场动画(受顶栏动效开关控制)。',
  controls: [
    {
      type: 'select',
      prop: 'size',
      label: '尺寸 size',
      default: 'md',
      options: [
        { value: 'sm', label: 'sm 小' },
        { value: 'md', label: 'md 中' },
        { value: 'lg', label: 'lg 大' },
        { value: 'full', label: 'full 铺满' },
      ],
    },
    {
      type: 'select',
      prop: 'placement',
      label: '位置 placement',
      default: 'center',
      options: [
        { value: 'center', label: 'center 居中' },
        { value: 'top', label: 'top 贴顶' },
      ],
    },
    {
      type: 'select',
      prop: 'tone',
      label: '色调 tone',
      default: 'primary',
      options: [
        { value: 'primary', label: 'primary 主色' },
        { value: 'accent', label: 'accent 强调' },
        { value: 'success', label: 'success 成功' },
        { value: 'warning', label: 'warning 警告' },
        { value: 'danger', label: 'danger 危险' },
        { value: 'info', label: 'info 信息' },
        { value: 'neutral', label: 'neutral 中性' },
      ],
    },
    { type: 'boolean', prop: 'dismissable', label: '点遮罩关闭 dismissable', default: true },
    {
      type: 'boolean',
      prop: 'hideCloseButton',
      label: '隐藏关闭按钮 hideCloseButton',
      default: false,
    },
  ],
};
