import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'editable',
  name: 'Editable',
  category: 'forms',
  summary:
    '行内编辑,点击 / 聚焦文本切换为输入态,Enter 或失焦提交、Esc 取消还原;支持多行、受控双通道与两态渲染留口。',
  description:
    '把静态文本就地变成可编辑输入的轻控件:展示态看似纯文本(空值显示占位),点击或键盘进入编辑态,Enter / 失焦提交、Esc 取消还原,值变化才回调。\n支持多行(multiline→textarea)、受控 / 非受控值(value / defaultValue)与编辑态(editing / defaultEditing)双通道、selectAllOnFocus、submitOnBlur / submitOnEnter 开关、maxLength。\n能进 Form(invalid + aria-invalid),并给 renderPreview / renderEdit 完全替换两态渲染的口子;提交 / 取消的键盘语义抽成零 React 纯逻辑。',
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
    { type: 'boolean', prop: 'multiline', label: '多行 multiline', default: false },
    {
      type: 'boolean',
      prop: 'selectAllOnFocus',
      label: '聚焦全选 selectAllOnFocus',
      default: true,
    },
    { type: 'boolean', prop: 'submitOnBlur', label: '失焦提交 submitOnBlur', default: true },
    { type: 'boolean', prop: 'invalid', label: '校验失败 invalid', default: false },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    { type: 'text', prop: 'placeholder', label: '占位 placeholder', default: '点击编辑标题' },
  ],
  spread: 'div',
};
