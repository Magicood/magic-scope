import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'checkbox',
  name: 'Checkbox',
  category: 'forms',
  summary: '复选框,基于原生 input[type=checkbox],checked 染主色画对勾、支持半选态。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\nlabel 包视觉隐藏的原生 input + 视觉方块(checked 画对勾、indeterminate 画横杠)+ 可选文字,可访问性与键盘可达性来自原生。\n完整覆盖 hover / focus-visible(发光环) / checked / indeterminate / disabled 状态与过渡;coarse 指针下用隐形 ::before 把命中区扩到 --ms-target-min;尊重 reduced-motion。',
  controls: [
    { type: 'text', prop: 'children', label: '标签文案', default: '接收邮件通知' },
    { type: 'text', prop: 'description', label: '次级说明 description', default: '' },
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
    { type: 'boolean', prop: 'defaultChecked', label: '初始勾选 defaultChecked', default: true },
    { type: 'boolean', prop: 'indeterminate', label: '半选 indeterminate', default: false },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
  ],
  spread: 'input',
};
