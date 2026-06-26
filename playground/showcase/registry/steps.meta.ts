import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'steps',
  name: 'Steps',
  category: 'navigation',
  summary: '步骤条 / 向导,线性流程指引,逐步派生 wait/process/finish/error 状态。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\ncurrent 受控/非受控双通道 + onChange(提供后各可用步可点击、键盘 ←→/↑↓/Home/End/Enter/Space 可达);支持 horizontal/vertical 方向、sm/default 尺寸、progressDot 点状、labelPlacement 标题位、percent 当前步进度环。\n每步圆点按状态着 tone 色(finish/process 主色、error danger、wait neutral),连线随流程染色;状态机集中在零 React 的 logic.ts,可平移多框架。数据入口双通道:items 数组 或 复合子组件 <Steps.Step />。',
  controls: [
    {
      type: 'select',
      prop: 'direction',
      label: '方向 direction',
      default: 'horizontal',
      options: [
        { value: 'horizontal', label: 'horizontal 水平' },
        { value: 'vertical', label: 'vertical 垂直' },
      ],
    },
    {
      type: 'select',
      prop: 'size',
      label: '尺寸 size',
      default: 'default',
      options: [
        { value: 'default', label: 'default' },
        { value: 'sm', label: 'sm 紧凑' },
      ],
    },
    {
      type: 'select',
      prop: 'status',
      label: '当前步状态 status',
      default: 'process',
      options: [
        { value: 'wait', label: 'wait 等待' },
        { value: 'process', label: 'process 进行中' },
        { value: 'finish', label: 'finish 已完成' },
        { value: 'error', label: 'error 出错' },
      ],
    },
    {
      type: 'select',
      prop: 'tone',
      label: '色调 tone',
      default: 'primary',
      options: [
        { value: 'primary', label: 'primary 奥术' },
        { value: 'accent', label: 'accent 强调' },
        { value: 'success', label: 'success 成功' },
        { value: 'warning', label: 'warning 警示' },
        { value: 'danger', label: 'danger 危险' },
        { value: 'info', label: 'info 信息' },
        { value: 'neutral', label: 'neutral 中性' },
      ],
    },
    {
      type: 'select',
      prop: 'labelPlacement',
      label: '标题位 labelPlacement',
      default: 'horizontal',
      options: [
        { value: 'horizontal', label: 'horizontal 右侧' },
        { value: 'vertical', label: 'vertical 下方' },
      ],
    },
    { type: 'boolean', prop: 'progressDot', label: '点状 progressDot', default: false },
    {
      type: 'number',
      prop: 'current',
      label: '当前步 current',
      default: 1,
      min: 0,
      max: 3,
      step: 1,
    },
  ],
  spread: 'div',
  alsoProps: ['Step'],
};
