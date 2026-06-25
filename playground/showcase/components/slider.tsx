import type { SliderSize } from '../../../packages/react/src/index';
import { Slider } from '../../../packages/react/src/index';
import type { DocEntry } from '../types';

export const entry: DocEntry = {
  id: 'slider',
  name: 'Slider',
  category: 'forms',
  summary: '滑块,基于原生 input[type=range],自绘轨道 / 填充 / 发光滑块。',
  description:
    '用原生 range 白嫖可访问的 slider 语义(role=slider、方向键 / Home / End);以 appearance:none + 伪元素自绘外观。支持受控与非受控,触控热区达标。',
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
    { type: 'boolean', prop: 'showValue', label: '显示数值 showValue', default: true },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    { type: 'number', prop: 'step', label: '步长 step', default: 1, min: 1, max: 25 },
  ],
  render: (v) => (
    <Slider
      key={`${v.size}-${v.step}`}
      defaultValue={40}
      min={0}
      max={100}
      step={v.step as number}
      size={v.size as SliderSize}
      showValue={v.showValue as boolean}
      disabled={v.disabled as boolean}
      formatValue={(n) => `${n}%`}
      aria-label="示例滑块"
      style={{ inlineSize: 'min(360px, 80vw)' }}
    />
  ),
  usage: `import { Slider } from '@magic-scope/react';

const [v, setV] = useState(40);
<Slider value={v} onValueChange={setV} showValue formatValue={(n) => \`\${n}%\`} />`,
  props: [
    { name: 'value', type: 'number', default: '—', description: '受控值。' },
    { name: 'defaultValue', type: 'number', default: 'min', description: '非受控初始值。' },
    {
      name: 'onValueChange',
      type: '(value: number) => void',
      default: '—',
      description: '值变化回调(拖动 / 键盘)。',
    },
    { name: 'min', type: 'number', default: '0', description: '最小值。' },
    { name: 'max', type: 'number', default: '100', description: '最大值。' },
    { name: 'step', type: 'number', default: '1', description: '步长。' },
    { name: 'size', type: `'sm' | 'md' | 'lg'`, default: `'md'`, description: '尺寸。' },
    {
      name: 'showValue',
      type: 'boolean',
      default: 'false',
      description: '在末尾渲染当前值(role=status 的 output)。',
    },
    {
      name: 'formatValue',
      type: '(value: number) => ReactNode',
      default: '—',
      description: '自定义值展示;仅 showValue 时生效。',
    },
  ],
  examples: [
    {
      title: '尺寸',
      node: (
        <div style={{ display: 'grid', gap: '1rem', inlineSize: 'min(360px, 80vw)' }}>
          <Slider defaultValue={30} size="sm" aria-label="sm" />
          <Slider defaultValue={50} size="md" aria-label="md" />
          <Slider defaultValue={70} size="lg" aria-label="lg" />
        </div>
      ),
    },
  ],
};
