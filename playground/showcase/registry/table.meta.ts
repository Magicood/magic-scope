import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'table',
  name: 'Table',
  category: 'data',
  summary: '数据表格,列定义 + 行数据驱动,支持斑马纹与行 hover 高亮。',
  description:
    '列定义(key / header / align / 自定义 render)+ 行数据驱动;斑马纹、行 hover、粘性表头等按需开启。逻辑属性,设备适配。',
  controls: [
    { type: 'boolean', prop: 'stripe', label: '斑马纹 stripe', default: false },
    { type: 'boolean', prop: 'hoverable', label: '行 hover', default: true },
  ],
};
