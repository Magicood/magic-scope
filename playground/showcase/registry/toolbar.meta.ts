import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'toolbar',
  name: 'Toolbar',
  category: 'actions',
  summary:
    'role=toolbar + roving tabindex 的复合动作容器,聚合按钮 / 链接 / 分隔 / 分组 / 单多选切换组,一组只占一个 Tab 位、方向键在项间移焦。',
  description:
    '把多个动作按钮聚成一条的工具栏:整组只占一个 Tab 序、方向键(横向 ←/→、纵向 ↑/↓、Home/End)在项间移焦(roving tabindex),用于编辑器 / 看板顶栏。\n子件覆盖动作按钮(Toolbar.Button)、链接(Toolbar.Link)、视觉分隔(Toolbar.Separator,role=separator)、逻辑分组(Toolbar.Group,role=group),以及单选 / 多选切换组(Toolbar.ToggleGroup + Toolbar.ToggleItem:single 走 radiogroup / radio,multiple 走 aria-pressed),切换组值受控 / 非受控双模式。\n内容过多可换行(wrap)或横向滚动,绝不撑破容器;键盘 roving 范式对齐库内 Tabs / Segmented。',
  controls: [
    {
      type: 'select',
      prop: 'orientation',
      label: '朝向 orientation',
      default: 'horizontal',
      options: [
        { value: 'horizontal', label: 'horizontal 横向' },
        { value: 'vertical', label: 'vertical 纵向' },
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
      prop: 'variant',
      label: '变体 variant',
      default: 'outline',
      options: [
        { value: 'solid', label: 'solid 实底' },
        { value: 'outline', label: 'outline 描边' },
        { value: 'plain', label: 'plain 无容器' },
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
    { type: 'boolean', prop: 'wrap', label: '换行 wrap', default: false },
  ],
  spread: 'div',
  alsoProps: [
    'Toolbar.Button',
    'Toolbar.Link',
    'Toolbar.Separator',
    'Toolbar.Group',
    'Toolbar.ToggleGroup',
    'Toolbar.ToggleItem',
  ],
};
