import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'accordion',
  name: 'Accordion',
  category: 'navigation',
  summary: '手风琴折叠面板组,single / multiple 两种展开模式,键盘可达。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\n展开/收起用 grid-template-rows: 0fr → 1fr 过渡,无需测量高度;头部为原生 <button>,带完整 aria 关联(aria-expanded / aria-controls,内容区 role="region" + aria-labelledby);↑↓ 在头部间移动焦点并跳过 disabled,Home / End 跳首尾,Enter / Space 由原生 button 触发切换。展开图标旋转量受顶栏「动效」开关控制。',
  controls: [
    {
      type: 'select',
      prop: 'type',
      label: '展开模式 type',
      default: 'single',
      options: [
        { value: 'single', label: 'single 单开' },
        { value: 'multiple', label: 'multiple 多开' },
      ],
    },
  ],
};
