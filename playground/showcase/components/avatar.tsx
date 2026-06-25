import type { AvatarShape, AvatarSize } from '../../../packages/react/src/index';
import { Avatar } from '../../../packages/react/src/index';
import type { DocEntry } from '../types';

const DEMO_SRC = 'https://i.pravatar.cc/120?img=13';

export const entry: DocEntry = {
  id: 'avatar',
  name: 'Avatar',
  category: 'data',
  summary: '头像,展示用户图片或姓名首字母占位,两种形状与三档尺寸。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n有 src 渲染 <img>(object-fit:cover 填充);无 src 时取 name 首字母(大写、最多 2 字)居中作占位,底色为 primary 与 surface 混色、文字 primary。圆形走 radius-full,方形走 radius-md。',
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
  render: (v) => (
    <Avatar
      size={v.size as AvatarSize}
      shape={v.shape as AvatarShape}
      name={v.name as string}
      src={v.showImage ? DEMO_SRC : undefined}
    />
  ),
  usage: `import { Avatar } from '@magic-scope/react';

<Avatar name="Merlin Ambrosius" />
<Avatar src="/u/13.png" name="Merlin" shape="square" />`,
  props: [
    { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, description: '尺寸。' },
    {
      name: 'shape',
      type: `'circle' | 'square'`,
      default: `'circle'`,
      description: '形状:圆形(radius-full)/ 方形(radius-md)。',
    },
    {
      name: 'src',
      type: 'string',
      default: '—',
      description: '头像图片地址。提供时渲染 <img>,object-fit:cover 填充。',
    },
    {
      name: 'name',
      type: 'string',
      default: '—',
      description:
        '用户名。无 src 时取首字母(大写、最多 2 字)作占位;同时用作无障碍标签 aria-label。',
    },
    {
      name: '...props',
      type: `ComponentPropsWithoutRef<'span'>`,
      default: '—',
      description: '透传原生 span 属性(className / style / title 等)。',
    },
  ],
  examples: [
    {
      title: '尺寸',
      node: (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Avatar size="sm" name="Sm" />
          <Avatar size="md" name="Md" />
          <Avatar size="lg" name="Lg" />
        </div>
      ),
    },
    {
      title: '形状',
      node: (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Avatar shape="circle" src={DEMO_SRC} name="Circle" />
          <Avatar shape="square" src={DEMO_SRC} name="Square" />
        </div>
      ),
    },
    {
      title: '图片与首字母占位',
      description: '有 src 渲染图片;无 src 取 name 首字母,单词取首尾两词首字母。',
      node: (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Avatar src={DEMO_SRC} name="Arthur Pendragon" />
          <Avatar name="Arthur Pendragon" />
          <Avatar name="Morgana" />
          <Avatar shape="square" name="Nimue Lake" />
        </div>
      ),
    },
  ],
};
