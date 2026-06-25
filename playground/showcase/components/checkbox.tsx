import { useState } from 'react';
import { Checkbox } from '../../../packages/react/src/index';
import type { ControlValues, DocEntry } from '../types';

/**
 * 受控演示:把 defaultChecked 旋钮的初始值接进局部 state,
 * 并以 key 让旋钮切换时重置勾选状态,这样方块既能点击切换、又能实时反映旋钮。
 */
function Demo({ values }: { values: ControlValues }) {
  const initial = values.defaultChecked as boolean;
  const [checked, setChecked] = useState(initial);
  return (
    <Checkbox
      key={String(initial)}
      checked={checked}
      onChange={(e) => setChecked(e.currentTarget.checked)}
      disabled={values.disabled as boolean}
    >
      {values.children as string}
    </Checkbox>
  );
}

export const entry: DocEntry = {
  id: 'checkbox',
  name: 'Checkbox',
  category: 'forms',
  summary: '复选框,基于原生 input[type=checkbox],checked 染主色并以 ::after 画对勾。',
  description:
    '自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。\nlabel 包视觉隐藏的原生 input + 视觉方块 + 可选文字,可访问性与键盘可达性来自原生。\n完整覆盖 hover / focus-visible(发光环) / checked / disabled 状态与过渡;coarse 指针下用隐形 ::before 把命中区扩到 --ms-target-min;尊重 reduced-motion。',
  controls: [
    { type: 'text', prop: 'children', label: '标签文案', default: '启用奥术增幅 ✦' },
    { type: 'boolean', prop: 'defaultChecked', label: '初始勾选 defaultChecked', default: true },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
  ],
  render: (v) => <Demo values={v} />,
  usage: `import { Checkbox } from '@magic-scope/react';

// 非受控
<Checkbox defaultChecked>同意条款</Checkbox>

// 受控
const [checked, setChecked] = useState(false);
<Checkbox checked={checked} onChange={(e) => setChecked(e.currentTarget.checked)}>
  订阅更新
</Checkbox>`,
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description: '方块右侧的文字标签;省略则只渲染方块。',
    },
    {
      name: 'checked',
      type: 'boolean',
      default: '—',
      description: '受控勾选态(配合 onChange 使用)。',
    },
    {
      name: 'defaultChecked',
      type: 'boolean',
      default: '—',
      description: '非受控初始勾选态。',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: '禁用:降透明度、禁止交互并变更光标。',
    },
    {
      name: '...props',
      type: `Omit<ComponentPropsWithoutRef<'input'>, 'type'>`,
      default: '—',
      description:
        '透传原生 input 属性(onChange / name / value / required / aria-* 等),type 固定为 checkbox。',
    },
  ],
  examples: [
    {
      title: '状态',
      node: (
        <div style={{ display: 'grid', gap: '0.6rem' }}>
          <Checkbox defaultChecked>已勾选</Checkbox>
          <Checkbox>未勾选</Checkbox>
          <Checkbox defaultChecked disabled>
            禁用(勾选)
          </Checkbox>
          <Checkbox disabled>禁用(未勾选)</Checkbox>
        </div>
      ),
    },
    {
      title: '仅方块(无标签)',
      node: <Checkbox defaultChecked aria-label="无标签复选框" />,
    },
  ],
};
