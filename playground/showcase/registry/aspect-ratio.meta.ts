import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'aspect-ratio',
  name: 'AspectRatio',
  category: 'layout',
  summary: '宽高比盒,用 CSS aspect-ratio 维持任意比例,子媒体绝对铺满并可裁剪。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n用 CSS `aspect-ratio` 维持任意宽高比;不支持的旧引擎经 `@supports` 自动回退 padding-top 百分比技巧,行为一致。\n能力:`ratio` 支持数字 / 比值字符串 / 断点对象(`{ base, sm, md, lg, xl, 2xl }`,纯静态 @media 渐进切换,零运行时);`objectFit` / `objectPosition` 透到子媒体;`rounded` 圆角档 + `clip` 裁剪;多态 `as` 与 `asChild`(Slot 风格)。\n留口:`...rest` 透传所有原生属性与事件,`className` / `style` 与计算值合并(用户 style 优先),`forwardRef` 到根元素。',
  controls: [
    {
      type: 'select',
      prop: 'ratio',
      label: '宽高比 ratio',
      default: '16 / 9',
      options: [
        { value: '16 / 9', label: '16 / 9 宽屏' },
        { value: '4 / 3', label: '4 / 3 标准' },
        { value: '1', label: '1 / 1 正方' },
        { value: '3 / 4', label: '3 / 4 竖图' },
        { value: '21 / 9', label: '21 / 9 超宽' },
      ],
    },
    {
      type: 'select',
      prop: 'objectFit',
      label: '填充 objectFit',
      default: 'cover',
      options: [
        { value: 'cover', label: 'cover 裁剪铺满' },
        { value: 'contain', label: 'contain 完整可见' },
        { value: 'fill', label: 'fill 拉伸' },
        { value: 'none', label: 'none 原尺寸' },
        { value: 'scale-down', label: 'scale-down 缩小适配' },
      ],
    },
    {
      type: 'select',
      prop: 'rounded',
      label: '圆角 rounded',
      default: 'md',
      options: [
        { value: 'none', label: 'none 不裁圆角' },
        { value: 'sm', label: 'sm' },
        { value: 'md', label: 'md' },
        { value: 'lg', label: 'lg' },
        { value: 'xl', label: 'xl' },
        { value: 'full', label: 'full 全圆' },
      ],
    },
    { type: 'boolean', prop: 'clip', label: '裁剪溢出 clip', default: true },
  ],
  spread: 'div',
};
