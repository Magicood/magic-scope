import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'heading',
  name: 'Heading',
  category: 'typography',
  summary: '语义标题 h1–h6,视觉与语义解耦(level 定标签、variant 定视觉),渐变/辉光/anchor。',
  description:
    '自研、复用 Text 的字族/tone/字重/对齐/截断/折行能力。\nlevel 定语义标签(h1–h6,可访问性大纲),variant 定视觉档(display/title/subtitle/overline/caption),二者独立(MUI 式)。\n标题默认 text-wrap:balance 多行均衡;支持渐变(可 aurora 极光)、辉光(受全局光影开关调制)、permalink anchor(CJK 友好 slug)。',
  controls: [
    {
      type: 'select',
      prop: 'level',
      label: '语义层级 level',
      default: '2',
      options: [
        { value: '1', label: 'h1' },
        { value: '2', label: 'h2' },
        { value: '3', label: 'h3' },
        { value: '4', label: 'h4' },
        { value: '5', label: 'h5' },
        { value: '6', label: 'h6' },
      ],
    },
    {
      type: 'select',
      prop: 'variant',
      label: '视觉档 variant',
      default: 'title',
      options: [
        { value: 'display', label: 'display 巨标题' },
        { value: 'title', label: 'title 标题' },
        { value: 'subtitle', label: 'subtitle 副标题' },
        { value: 'overline', label: 'overline 上标签' },
        { value: 'caption', label: 'caption 说明' },
      ],
    },
    {
      type: 'select',
      prop: 'tone',
      label: '色调 tone',
      default: 'neutral',
      options: [
        { value: 'neutral', label: 'neutral 默认' },
        { value: 'primary', label: 'primary' },
        { value: 'accent', label: 'accent' },
        { value: 'success', label: 'success' },
        { value: 'warning', label: 'warning' },
        { value: 'danger', label: 'danger' },
        { value: 'info', label: 'info' },
      ],
    },
    {
      type: 'select',
      prop: 'gradient',
      label: '渐变 gradient',
      default: 'off',
      options: [
        { value: 'off', label: '关闭' },
        { value: 'tone', label: 'tone 实渐变' },
        { value: 'aurora', label: 'aurora 极光' },
      ],
    },
    { type: 'boolean', prop: 'glow', label: '辉光 glow', default: false },
    { type: 'boolean', prop: 'dimmed', label: '弱化 dimmed', default: false },
    { type: 'text', prop: 'children', label: '文案', default: '产品概览 ✦ Product Overview' },
  ],
  spread: 'h2',
};
