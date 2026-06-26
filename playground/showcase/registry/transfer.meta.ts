import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'transfer',
  name: 'Transfer',
  category: 'data',
  summary: '双列穿梭框,把数据项在「源池」与「目标」之间移动,移动逻辑为可单测纯函数。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。真相源是单一 dataSource + targetKeys,切栏 / 过滤 / 算方向的移动逻辑全在零 React 的 logic.ts(可平移内核),onChange 回传 (targetKeys, direction, moveKeys) 便于外部审计。\n两栏对称:各带全选表头(显示「已选 X/Y」计数)、按项 Checkbox、可选搜索框与空态;中间方向按钮按两侧选中态启用,支持单向模式。受控 targetKeys 与非受控 defaultTargetKeys 并存。a11y:list(ul/li)+ 每项 / 表头 checkbox + 带可访问名的方向 button;长 title 截断不撑破,尊重 prefers-reduced-motion。',
  controls: [
    { type: 'boolean', prop: 'showSearch', label: '搜索框 showSearch', default: false },
    { type: 'boolean', prop: 'oneWay', label: '单向模式 oneWay', default: false },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
  ],
  spread: 'div',
};
