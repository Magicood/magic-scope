import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'text',
  name: 'Text',
  category: 'typography',
  summary: '文字排版旗舰原语,多态 as,全字号/字重/字距,渐变/光晕/描边与入场动效。',
  description:
    '把「所有可控文字属性」收成 props:字族/字号/字重/斜体、tone 着色、对齐/行高/字距、装饰/transform、截断(单行+多行)、折行/空白/断词/方向、数字变体/小型大写。\n视觉层:gradient(tone / aurora 极光)、glow(光晕)、stroke(描边镂空),受全局「光影」开关调制。动效层:reveal 上浮 / blur-in 模糊聚焦 / shimmer 高光 / pulse 呼吸 / flow 渐变流动,受 data-ms-motion 与 prefers-reduced-motion 调制,关闭时降级为静态。\n多态:as 切任意标签、asChild 合并到子元素;...rest 透传所有原生属性与事件。',
  controls: [
    {
      type: 'select',
      prop: 'size',
      label: '字号 size',
      default: '2xl',
      options: [
        { value: 'xs', label: 'xs' },
        { value: 'sm', label: 'sm' },
        { value: 'base', label: 'base' },
        { value: 'lg', label: 'lg' },
        { value: 'xl', label: 'xl' },
        { value: '2xl', label: '2xl' },
        { value: '3xl', label: '3xl' },
        { value: '4xl', label: '4xl' },
        { value: '5xl', label: '5xl' },
      ],
    },
    {
      type: 'select',
      prop: 'weight',
      label: '字重 weight',
      default: 'bold',
      options: [
        { value: 'normal', label: 'normal' },
        { value: 'medium', label: 'medium' },
        { value: 'semibold', label: 'semibold' },
        { value: 'bold', label: 'bold' },
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
    {
      type: 'select',
      prop: 'gradient',
      label: '渐变 gradient',
      default: 'none',
      options: [
        { value: 'none', label: '无' },
        { value: 'tone', label: 'tone 实色渐变' },
        { value: 'aurora', label: 'aurora 极光' },
      ],
    },
    {
      type: 'select',
      prop: 'animate',
      label: '动效 animate',
      default: 'none',
      options: [
        { value: 'none', label: '无' },
        { value: 'reveal', label: 'reveal 上浮' },
        { value: 'blur-in', label: 'blur-in 模糊聚焦' },
        { value: 'shimmer', label: 'shimmer 高光' },
        { value: 'pulse', label: 'pulse 呼吸' },
        { value: 'flow', label: 'flow 渐变流动' },
      ],
    },
    { type: 'text', prop: 'children', label: '文案', default: '排版即设计 ✦' },
  ],
  spread: 'div',
};
