import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'color-picker',
  name: 'ColorPicker',
  category: 'forms',
  summary: '颜色选择器:2D 饱和度-明度面板 + hue/alpha 滑条 + 三格式互转 + 预设 + 屏幕取色。',
  description:
    '自研、零依赖,内部以 HSVA 为唯一真相源,全部色彩数学(HSV/RGB/HSL/HEX 互转、parseColor/formatColor)抽成纯函数沉到 logic.ts,便于平移 vue / web-component 共用同一套色彩语义。色块按钮触发并复用 Popover 浮层承载面板。\n交互含拖拽式 2D 饱和度-明度面板、hue 与可选 alpha 滑条(棋盘格底)、hex/rgb/hsl 文本输入与格式切换、预设色板,以及 Chromium 上的系统级 EyeDropper 屏幕取色(特性检测,不支持即不渲染)。面板与各滑条均 role=slider、方向键全键盘可达,尊重 prefers-reduced-motion 与 data-ms-motion=off。',
  controls: [
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
      prop: 'format',
      label: '输出格式 format',
      default: 'hex',
      options: [
        { value: 'hex', label: 'hex' },
        { value: 'rgb', label: 'rgb' },
        { value: 'hsl', label: 'hsl' },
      ],
    },
    {
      type: 'select',
      prop: 'placement',
      label: '浮层方位 placement',
      default: 'bottom-start',
      options: [
        { value: 'bottom-start', label: 'bottom-start' },
        { value: 'bottom', label: 'bottom' },
        { value: 'bottom-end', label: 'bottom-end' },
        { value: 'top-start', label: 'top-start' },
        { value: 'right-start', label: 'right-start' },
      ],
    },
    { type: 'boolean', prop: 'alpha', label: '透明度 alpha', default: true },
    { type: 'boolean', prop: 'formatSwitcher', label: '格式切换器 formatSwitcher', default: true },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
  ],
  spread: 'button',
};
