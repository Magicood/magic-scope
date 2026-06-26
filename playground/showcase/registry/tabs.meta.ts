import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'tabs',
  name: 'Tabs',
  category: 'navigation',
  summary: '标签页,受控 / 非受控双模式,完整 ARIA 与方向键导航,underline / pill 两变体。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\nrole="tablist" / "tab" / "tabpanel" 全套 ARIA 关联,采用 roving tabIndex(仅选中项进 Tab 序)。键盘 ← → ↑ ↓ 在可用标签间循环切换(跳过 disabled),Home / End 跳首尾。underline 变体选中项下方主色条带发光,pill 变体选中项 primary 实底。省略 content 时只切换标签、不渲染 tabpanel,适合外部自管内容区。',
  controls: [
    {
      type: 'select',
      prop: 'variant',
      label: '变体 variant',
      default: 'underline',
      options: [
        { value: 'underline', label: 'underline 下划线' },
        { value: 'pill', label: 'pill 胶囊' },
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
    {
      type: 'select',
      prop: 'size',
      label: '尺寸 size',
      default: 'md',
      options: [
        { value: 'sm', label: 'sm 小' },
        { value: 'md', label: 'md 中' },
        { value: 'lg', label: 'lg 大' },
      ],
    },
    {
      type: 'select',
      prop: 'orientation',
      label: '朝向 orientation',
      default: 'horizontal',
      options: [
        { value: 'horizontal', label: 'horizontal 横向' },
        { value: 'vertical', label: 'vertical 竖排' },
      ],
    },
  ],
};
