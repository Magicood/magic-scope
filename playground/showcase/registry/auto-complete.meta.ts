import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'auto-complete',
  name: 'AutoComplete',
  category: 'forms',
  summary: '自由文本输入 + 下拉补全建议;Popover API + CSS Anchor Positioning,键盘全可达。',
  description:
    '与 Select 的区别是「值就是输入串」——候选项只作补全提示,不强制从中选取。输入即开下拉,键盘 ↑↓ 高亮 / Enter 选中填入 / Esc 关闭。\n自研、零依赖:浮层进 top-layer 用原生 Popover API(popover="auto" 自带点外 / Esc 关闭),定位用 CSS Anchor Positioning 并以 @supports 降级。生产特性齐备:options 平铺 / 分组、filterOption(false 关内置过滤配 onSearch 做远程异步搜索,或传谓词自定义命中)、loading 加载态、空态、allowClear、disabled、size、invalid(供 Form)、tone 槽位与 i18n;留口 prefix / renderOption / classNames 部件定制、原生属性透传。',
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
      prop: 'tone',
      label: '色调 tone',
      default: 'primary',
      options: [
        { value: 'primary', label: 'primary' },
        { value: 'accent', label: 'accent' },
        { value: 'success', label: 'success' },
        { value: 'warning', label: 'warning' },
        { value: 'danger', label: 'danger' },
        { value: 'info', label: 'info' },
      ],
    },
    { type: 'boolean', prop: 'disabled', label: '禁用 disabled', default: false },
    { type: 'boolean', prop: 'allowClear', label: '可清除 allowClear', default: false },
    { type: 'boolean', prop: 'loading', label: '加载态 loading', default: false },
    { type: 'boolean', prop: 'invalid', label: '校验失败 invalid', default: false },
  ],
};
