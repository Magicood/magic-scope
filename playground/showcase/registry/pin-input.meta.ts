import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'pin-input',
  name: 'PinInput',
  category: 'forms',
  summary: 'OTP/验证码分段输入,逐格单字符、自动跳格、整串粘贴自动分填,受控/非受控两用。',
  description:
    '自研、零依赖:字符过滤与「串↔定长格数组」互转抽成零 React 纯函数(logic.ts,可平移多框架),组件只把它们接进状态 / DOM / 键盘。\nlength 个单字符格——合法字符即时跳下一格、Backspace 在空格回退并清前一格、粘贴整串自动分填、←→/Home/End 焦点导航;type 限定收字范围(numeric / alphanumeric),mask 掩码敏感口令,invalid 染 danger 发光环,填满触发 onComplete 上升沿。\na11y:外层 role=group + i18n aria-label,每格独立「第 N 位」aria-label 与 aria-invalid,键盘完全可达;尺寸随 data-ms-density 缩放,触控热区抬到 --ms-target-min,动效在 prefers-reduced-motion 与 data-ms-motion=off 下降级。',
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
    {
      type: 'select',
      prop: 'type',
      label: '收字范围 type',
      default: 'numeric',
      options: [
        { value: 'numeric', label: 'numeric 仅数字' },
        { value: 'alphanumeric', label: 'alphanumeric 数字+字母' },
      ],
    },
    { type: 'number', prop: 'length', label: '格数 length', default: 6, min: 3, max: 8, step: 1 },
    { type: 'boolean', prop: 'mask', label: '掩码 mask', default: false },
    { type: 'boolean', prop: 'invalid', label: '错误态 invalid', default: false },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
  ],
  spread: 'div',
};
