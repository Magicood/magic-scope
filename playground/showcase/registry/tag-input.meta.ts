import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'tag-input',
  name: 'TagInput',
  category: 'forms',
  summary:
    '标签 / 令牌输入,输入框内把已添加项渲染成可删除芯片,回车或分隔符成标签,空输入 Backspace 删尾。',
  description:
    '把自由文本切成多枚可删除标签的输入控件:回车 / 自定义分隔符(默认逗号)成 tag、空输入 Backspace 删尾、粘贴含分隔符的串一次性切多枚。\n约束侧:maxTags 限数量、默认去重(caseSensitive 可配)、validate 校验被拒走 onReject;受控 / 非受控双通道接 Form(invalid + aria-invalid)。\n差异化深度:双击改写标签(editable)、失焦自动提交残留(addOnBlur)、清空全部(clearable)、renderTag 完全自绘留口;纯算法抽进 logic.ts。',
  controls: [
    {
      type: 'select',
      prop: 'size',
      label: '尺寸 size',
      default: 'md',
      options: [
        { value: 'sm', label: 'sm 小' },
        { value: 'md', label: 'md 中' },
        { value: 'lg', label: 'lg 大' },
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
      ],
    },
    {
      type: 'number',
      prop: 'maxTags',
      label: '上限 maxTags',
      default: 6,
      min: 1,
      max: 12,
      step: 1,
    },
    { type: 'boolean', prop: 'allowDuplicates', label: '允许重复 allowDuplicates', default: false },
    { type: 'boolean', prop: 'editable', label: '双击可改 editable', default: true },
    { type: 'boolean', prop: 'clearable', label: '可清空 clearable', default: true },
    { type: 'boolean', prop: 'addOnBlur', label: '失焦提交 addOnBlur', default: true },
    { type: 'boolean', prop: 'invalid', label: '校验失败 invalid', default: false },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    { type: 'text', prop: 'placeholder', label: '占位 placeholder', default: '输入后回车添加…' },
  ],
  spread: 'div',
};
