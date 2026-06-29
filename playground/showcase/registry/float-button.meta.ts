import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'float-button',
  name: 'FloatButton',
  category: 'navigation',
  summary: '悬浮操作钮(FAB):圆/方形 × 7 色调,带角标、tooltip,配套可展开 speed-dial 菜单。',
  description:
    '自研、零依赖,固定定位的悬浮操作入口。单钮支持 circle/square 形状、default/primary 类型与全库 7 色调 tone(只读 6 槽位、零硬编码配色与发光);可带 icon、方形内 description 文字(超长截断不撑破)、数字/小红点 badge(超 overflowCount 截为 N+)。\n传 href 即渲染为 <a>(导航语义,_blank 自动补 rel),否则渲染 <button>;传 tooltip 自动用 Tooltip 包裹(hover/focus 弹出)。配套 FloatButton.Group 堆叠/可展开菜单:click/hover 触发,子项沿 direction 错峰弹出,受控/非受控双通道,触发钮 aria-expanded/aria-controls 关联、收起态 inert 移出 tab 序、Esc 收起,错峰入场在 reduced-motion / data-ms-motion=off 下优雅降级。',
  controls: [
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
    {
      type: 'select',
      prop: 'type',
      label: '类型 type',
      default: 'default',
      options: [
        { value: 'default', label: 'default 中性面' },
        { value: 'primary', label: 'primary 实底发光' },
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
      type: 'number',
      prop: 'badge',
      label: '角标数字 badge',
      default: 0,
      min: 0,
      max: 120,
      step: 1,
    },
    {
      type: 'text',
      prop: 'tooltip',
      label: '提示 tooltip',
      default: '新建',
      placeholder: '留空则不显示',
    },
    {
      type: 'text',
      prop: 'description',
      label: '方形内文字 description',
      default: '',
      placeholder: '仅方形可见',
    },
  ],
};
