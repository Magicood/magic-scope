import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'link',
  name: 'Link',
  category: 'typography',
  summary: '内联超链接,下划线四态、tone 着色、外链一键安全化与禁用模拟。',
  description:
    '真正的 <a> 原语,把链接的交互/语义/装饰收成 props。\n下划线四态(auto/hover/always/none)、语义 tone 着色(默认走专用链接角色色)、字号档继承上下文;external 自动补 target=_blank + rel="noopener noreferrer" + 外链图标 + sr-only 新窗口提示;disabled 以「去 href + aria-disabled + 拦截点击」综合模拟,读屏仍报为被禁用链接。muted 次级、glow 微光辉光、asChild 多态(路由 Link)。',
  controls: [
    {
      type: 'select',
      prop: 'underline',
      label: '下划线 underline',
      default: 'auto',
      options: [
        { value: 'auto', label: 'auto 静止有/hover 去' },
        { value: 'hover', label: 'hover 才出现' },
        { value: 'always', label: 'always 始终有' },
        { value: 'none', label: 'none 从不' },
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
      label: '字号 size',
      default: 'inherit',
      options: [
        { value: 'inherit', label: 'inherit 继承' },
        { value: 'xs', label: 'xs' },
        { value: 'sm', label: 'sm' },
        { value: 'base', label: 'base' },
        { value: 'lg', label: 'lg' },
        { value: 'xl', label: 'xl' },
      ],
    },
    {
      type: 'select',
      prop: 'glow',
      label: '微光 glow',
      default: 'off',
      options: [
        { value: 'off', label: 'off 关闭' },
        { value: 'hover', label: 'hover 仅悬停' },
        { value: 'always', label: 'always 常亮' },
      ],
    },
    { type: 'boolean', prop: 'external', label: '外链 external', default: false },
    { type: 'boolean', prop: 'muted', label: '弱化 muted', default: false },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    { type: 'text', prop: 'children', label: '文案', default: '查看产品文档' },
  ],
  spread: 'a',
};
