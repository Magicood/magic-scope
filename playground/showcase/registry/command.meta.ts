import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'command',
  name: 'Command',
  category: 'navigation',
  summary:
    '命令面板(⌘K),带模糊 / 子串过滤、命中高亮、键盘导航与分组的可组合命令搜索框,可独立内嵌或包成 Command.Dialog 模态。',
  description:
    '对标 cmdk / raycast / macOS Spotlight 的命令面板:输入即时过滤命令(连续子串与允许跳字符的模糊匹配),命中字符高亮;↑↓ 在结果间移动且跳过禁用项与分组标题,Enter 执行,Home/End 跳首尾。\n命令可分组(组头不可选)、可加关键词别名参与匹配、可挂图标与快捷键提示;既能作页内内嵌控件,也能一键包进模态对话框(复用 Dialog 的焦点陷阱 / Esc / top-layer,可监听 mod+k 唤起)。\na11y 走 combobox + listbox + option 组合角色。复合 Command / Command.Input / Command.List / Command.Group / Command.Item / Command.Empty / Command.Dialog。',
  controls: [
    {
      type: 'select',
      prop: 'filterMode',
      label: '过滤模式 filterMode',
      default: 'fuzzy',
      options: [
        { value: 'fuzzy', label: 'fuzzy 模糊(可跳字符)' },
        { value: 'substring', label: 'substring 连续子串' },
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
      ],
    },
    { type: 'boolean', prop: 'shouldFilter', label: '内建过滤 shouldFilter', default: true },
    { type: 'boolean', prop: 'loop', label: '上下环绕 loop', default: true },
  ],
  alsoProps: [
    'Command.Input',
    'Command.List',
    'Command.Group',
    'Command.Item',
    'Command.Empty',
    'Command.Dialog',
  ],
};
