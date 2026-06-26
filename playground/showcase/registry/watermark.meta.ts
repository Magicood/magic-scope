import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'watermark',
  name: 'Watermark',
  category: 'layout',
  summary: '在任意内容上平铺旋转的文字 / 图片水印,pointer-events:none 绝不挡下层交互。',
  description:
    '自研、零依赖的 layout 原语:用离屏 canvas 绘制一个水印「单元」(文字多行或图片,带旋转),按 devicePixelRatio 放大后 toDataURL,作为覆盖层的 repeating background 无缝平铺——而非 DOM 文本堆叠,故 Retina 不糊、节点极少。\n覆盖层绝对定位铺满、aria-hidden 纯装饰不进可访问性树、pointer-events:none 不挡点击 / 选择 / 滚动;rotate / gap / offset / opacity / fontSize / fontColor / fontFamily / zIndex 全可控,文字与图片二选一(image 优先)。\n降级安全:SSR / 无 2d 上下文 / 图片加载失败时不渲染背景但仍正常包裹 children、不抛错。诚实备注:当前未做 MutationObserver 防删除加固,面向视觉水印 / 溯源标注而非对抗恶意 DOM 篡改。',
  controls: [
    {
      type: 'text',
      prop: 'content',
      label: '水印文字 content',
      default: '@magic-scope',
      placeholder: '输入水印文字',
    },
    {
      type: 'number',
      prop: 'rotate',
      label: '旋转角 rotate(度)',
      default: -22,
      min: -90,
      max: 90,
      step: 1,
    },
    {
      type: 'number',
      prop: 'opacity',
      label: '不透明度 opacity',
      default: 0.15,
      min: 0,
      max: 1,
      step: 0.01,
    },
    {
      type: 'number',
      prop: 'fontSize',
      label: '字号 fontSize(px)',
      default: 16,
      min: 10,
      max: 40,
      step: 1,
    },
    {
      type: 'select',
      prop: 'fontColor',
      label: '文字颜色 fontColor',
      default: 'rgba(120, 120, 130, 1)',
      options: [
        { value: 'rgba(120, 120, 130, 1)', label: '中性灰(默认)' },
        { value: 'rgba(124, 92, 255, 1)', label: '奥术紫' },
        { value: 'rgba(56, 189, 248, 1)', label: '霜寒青' },
        { value: 'rgba(244, 63, 94, 1)', label: '余烬品红' },
      ],
    },
    { type: 'number', prop: 'zIndex', label: '层级 zIndex', default: 9, min: 0, max: 99, step: 1 },
  ],
  // 根透传一个 div(...rest 落到根容器)。
  spread: 'div',
};
