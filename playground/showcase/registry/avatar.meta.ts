import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'avatar',
  name: 'Avatar',
  category: 'data',
  summary: '头像,展示用户图片或姓名首字母占位,两种形状与三档尺寸。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n有 src 渲染 <img>(object-fit:cover 填充);无 src 时取 name 首字母(大写、最多 2 字)居中作占位,底色为 primary 与 surface 混色、文字 primary。圆形走 radius-full,方形走 radius-md。role="img" + aria-label=name 提供无障碍标签。',
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
      prop: 'shape',
      label: '形状 shape',
      default: 'circle',
      options: [
        { value: 'circle', label: 'circle 圆形' },
        { value: 'square', label: 'square 方形' },
      ],
    },
    { type: 'boolean', prop: 'showImage', label: '显示图片 src', default: false },
    { type: 'text', prop: 'name', label: '用户名 name', default: 'Merlin Ambrosius' },
  ],
  spread: 'span',
};
