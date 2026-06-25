import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'popconfirm',
  name: 'Popconfirm',
  category: 'composite',
  summary: '锚定在元素旁的轻量确认气泡,内建确认 / 取消按钮流,常用于内联删除确认。',
  description:
    'compose 了 Popover(原生 Popover API + CSS Anchor Positioning,自带点外 / 取消 / Esc 关闭)与 Button(确认 / 取消按钮),在 trigger 旁弹出确认气泡而非全屏模态。\ndanger 变体把确认按钮染危险色;点外 / Esc 关闭等同取消(触发 onCancel)。适合列表内联删除等不打断上下文的二次确认。',
  controls: [
    {
      type: 'select',
      prop: 'variant',
      label: '变体 variant',
      default: 'default',
      options: [
        { value: 'default', label: 'default 默认' },
        { value: 'danger', label: 'danger 危险' },
      ],
    },
    {
      type: 'select',
      prop: 'placement',
      label: '方位 placement',
      default: 'top',
      options: [
        { value: 'top', label: 'top 上' },
        { value: 'bottom', label: 'bottom 下' },
        { value: 'left', label: 'left 左' },
        { value: 'right', label: 'right 右' },
      ],
    },
    { type: 'text', prop: 'title', label: '标题 title', default: '确定执行此操作?' },
    {
      type: 'text',
      prop: 'description',
      label: '描述 description',
      default: '操作不可撤销,请确认。',
    },
    { type: 'text', prop: 'confirmText', label: '确认文案 confirmText', default: '确定' },
    { type: 'text', prop: 'cancelText', label: '取消文案 cancelText', default: '取消' },
  ],
};
