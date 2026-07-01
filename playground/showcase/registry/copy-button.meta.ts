import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'copy-button',
  name: 'CopyButton',
  category: 'actions',
  summary:
    '复制按钮,点击写入剪贴板并进入「已复制」反馈态(图标切对勾 + 可选 Tooltip),超时自动还原。',
  description:
    '高频「一键复制」场景(token / 命令 / 分享链接)的开箱即用按钮:点击即写剪贴板,给出明确即时反馈。\n复制成功后图标从复制图标切到对勾、可选 Tooltip 提示「已复制」,timeout(默认 1500ms)后自动还原;复用 Button 的 tone / size / variant 与 Tooltip,不另起一套样式。\n剪贴板写入做特性检测降级:优先 navigator.clipboard.writeText(需安全上下文),回退 document.execCommand。a11y:aria-label 随状态切换并经 aria-live 播报。\n留口:render-prop children (copied) => ReactNode、icon / copiedIcon 覆盖图标、onCopy / onError 回调。',
  controls: [
    {
      type: 'select',
      prop: 'variant',
      label: '变体 variant',
      default: 'soft',
      options: [
        { value: 'solid', label: 'solid 实底' },
        { value: 'soft', label: 'soft 柔底' },
        { value: 'outline', label: 'outline 描边' },
        { value: 'ghost', label: 'ghost 幽灵' },
        { value: 'link', label: 'link 链接' },
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
    { type: 'boolean', prop: 'withTooltip', label: '带 Tooltip 提示 withTooltip', default: true },
    {
      type: 'number',
      prop: 'timeout',
      label: '还原延时 timeout(ms)',
      default: 1500,
      min: 500,
      max: 4000,
      step: 250,
    },
    {
      type: 'text',
      prop: 'value',
      label: '要复制的文本 value',
      default: 'npm i @magic-scope/react',
    },
  ],
  spread: 'button',
};
