import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'tag',
  name: 'Tag',
  category: 'data',
  summary: '语义色标签,六档 tone 柔和底色,可选关闭按钮,用于分类、过滤与可移除项。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\ntone 用 color-mix 调出 18% 柔和底 + tone 文字,紧凑内边距适合密集场景。\nclosable 时在末尾渲染移除按钮,hover 加深、focus-visible 显示发光环;移除逻辑由 onRemove 交给上层 state 控制。透传原生 span 属性(title / onClick 等)。',
  controls: [
    {
      type: 'select',
      prop: 'tone',
      label: '色调 tone',
      default: 'neutral',
      options: [
        { value: 'primary', label: 'primary 主色' },
        { value: 'accent', label: 'accent 强调' },
        { value: 'success', label: 'success 成功' },
        { value: 'warning', label: 'warning 警告' },
        { value: 'danger', label: 'danger 危险' },
        { value: 'neutral', label: 'neutral 中性' },
      ],
    },
    { type: 'boolean', prop: 'closable', label: '可关闭 closable', default: false },
    { type: 'text', prop: 'children', label: '文案', default: '奥术 ✦' },
  ],
  spread: 'span',
};
