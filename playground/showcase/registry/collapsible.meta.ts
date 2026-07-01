import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'collapsible',
  name: 'Collapsible',
  category: 'data',
  summary:
    '单项折叠原语,Trigger 切换按钮 + Content 可折叠区,高度过渡平滑展开收起,Content 常驻挂载保活子树。',
  description:
    '比 Accordion 更底层的单个开合原语:没有 single / multiple 互斥分组,只管「一段内容的展开与收起」,供自由拼装(FAQ 行、设置项、详情块、侧栏分区)。\n复合 API(Collapsible + Collapsible.Trigger + Collapsible.Content),受控(open + onOpenChange)/ 非受控(defaultOpen)双通道、disabled 整体禁用。\n高度过渡用 grid-template-rows 0fr↔1fr 平滑撑高,随 reduced-motion / data-ms-motion=off 降级瞬时。a11y:Trigger 原生 button + aria-expanded / aria-controls,Content role=region;Content 常驻挂载并 inert 收起态。',
  controls: [
    { type: 'boolean', prop: 'defaultOpen', label: '初始展开 defaultOpen', default: false },
    {
      type: 'select',
      prop: 'tone',
      label: '色调 tone',
      default: 'primary',
      options: [
        { value: 'primary', label: 'primary 主色' },
        { value: 'accent', label: 'accent 强调' },
        { value: 'success', label: 'success 成功' },
        { value: 'warning', label: 'warning 警告' },
        { value: 'danger', label: 'danger 危险' },
        { value: 'info', label: 'info 信息' },
        { value: 'neutral', label: 'neutral 中性' },
      ],
    },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    { type: 'text', prop: 'label', label: '触发文案', default: '查看订单明细' },
  ],
  alsoProps: ['Collapsible.Trigger', 'Collapsible.Content'],
};
