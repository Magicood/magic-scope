import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'spin',
  name: 'Spin',
  category: 'feedback',
  summary: '加载遮罩,就地盖在任意区域上方,内容不卸载、保留布局、屏蔽交互。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。包裹任意 children,spinning 时在其上盖半透明遮罩 + 居中加载符文(默认复用 Spinner,可 indicator 自定义),内容不卸载——保留布局、降透明度并模糊、屏蔽交互。\n短促请求用 delay 防闪烁(spinning 须持续超过 delay 才真正显示,收起永远即时;判定抽成纯函数可单测)。支持 tip 文字、size、tone 语义色调与 fullscreen 全屏遮罩;无 children 时退化为行内/块级独立指示器。\na11y:遮罩 role=status + aria-busy + aria-live=polite 播报 tip(或 i18n「加载中」),被遮内容 aria-hidden + inert 防读屏与键盘穿透到不可见交互。',
  controls: [
    { type: 'boolean', prop: 'spinning', label: '加载中 spinning', default: true },
    {
      type: 'select',
      prop: 'size',
      label: '尺寸 size',
      default: 'md',
      options: [
        { value: 'sm', label: 'sm' },
        { value: 'md', label: 'md' },
        { value: 'lg', label: 'lg' },
      ],
    },
    {
      type: 'select',
      prop: 'tone',
      label: '色调 tone',
      default: 'primary',
      options: [
        { value: 'primary', label: 'primary' },
        { value: 'accent', label: 'accent' },
        { value: 'success', label: 'success' },
        { value: 'warning', label: 'warning' },
        { value: 'danger', label: 'danger' },
        { value: 'info', label: 'info' },
        { value: 'neutral', label: 'neutral' },
      ],
    },
    { type: 'text', prop: 'tip', label: '提示文字 tip', default: '召唤资源中…' },
    {
      type: 'number',
      prop: 'delay',
      label: '防闪烁延迟 delay(ms)',
      default: 0,
      min: 0,
      max: 2000,
      step: 100,
    },
  ],
  spread: 'div',
};
