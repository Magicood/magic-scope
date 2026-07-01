import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'marquee',
  name: 'Marquee',
  category: 'data',
  summary:
    '无限跑马灯,children 沿主轴无缝无限滚动(内容克隆 N 份首尾相接,CSS transform 位移后回卷)。',
  description:
    'logo 墙 / 公告 / 弹幕场景的无限滚动条:内容首尾相接视觉无缝、GPU 友好(只动 transform)。\n支持四方向(left / right / up / down)与横纵双向(vertical),speed(px/s)或 duration(固定圈秒)控速,悬停(pauseOnHover)或按下(pauseOnClick)暂停,两端淡出遮罩(gradient),自动或固定克隆份数(repeat)。\nreduced-motion / data-ms-motion=off 下停滚静态展示;克隆份对 AT 隐藏、整体可命名、不抢焦点。',
  controls: [
    {
      type: 'select',
      prop: 'direction',
      label: '方向 direction',
      default: 'left',
      options: [
        { value: 'left', label: 'left 向左' },
        { value: 'right', label: 'right 向右' },
        { value: 'up', label: 'up 向上' },
        { value: 'down', label: 'down 向下' },
      ],
    },
    {
      type: 'number',
      prop: 'speed',
      label: '速度 speed(px/s)',
      default: 60,
      min: 10,
      max: 200,
      step: 10,
    },
    { type: 'boolean', prop: 'pauseOnHover', label: '悬停暂停 pauseOnHover', default: true },
    { type: 'boolean', prop: 'gradient', label: '两端淡出 gradient', default: true },
    { type: 'boolean', prop: 'reverse', label: '反向 reverse', default: false },
  ],
  spread: 'div',
};
