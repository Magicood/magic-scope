import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'radio',
  name: 'Radio',
  category: 'forms',
  summary: '单选组,基于原生 input[type=radio],方向键导航与 roving tabindex 开箱即用。',
  description:
    'compose 了 RadioGroup(role="radiogroup")+ Radio(原生 input[type=radio])两件。\nRadioGroup 用 context 把 name / 选中值 / 尺寸 / 禁用下发给组内 Radio,支持受控(value)与非受控(defaultValue);同 name 自动获得原生方向键导航与 roving tabindex。\n完整覆盖 hover / focus-visible(发光环)/ checked / disabled 状态,触控热区达标并尊重 reduced-motion。',
  controls: [
    {
      type: 'select',
      prop: 'orientation',
      label: '方向 orientation',
      default: 'vertical',
      options: [
        { value: 'vertical', label: 'vertical 纵向' },
        { value: 'horizontal', label: 'horizontal 横向' },
      ],
    },
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
    {
      type: 'select',
      prop: 'appearance',
      label: '外观 appearance',
      default: 'control',
      options: [
        { value: 'control', label: 'control 圆点' },
        { value: 'card', label: 'card 卡片' },
      ],
    },
    { type: 'boolean', prop: 'disabled', label: '整组禁用 disabled', default: false },
  ],
  spread: 'input',
  alsoProps: ['RadioGroup'],
};
