import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'calendar',
  name: 'Calendar',
  category: 'data',
  summary:
    '独立月历,整月铺展的日期网格,支持单选 / 范围 / 多选、今天高亮、禁用规则、周起始切换、单元格自定义渲染与完整键盘网格导航。',
  description:
    '区别于 DatePicker(输入框 + 弹层)的「独立月历」:直接平铺展示一整月,顶部逐月 / 逐年翻页并显示年月标题,主体是周几表头 + 6×7 固定日格(含上 / 下月补位并弱化)。\n选择覆盖单选(value)、范围(mode=range)、多选(mode=multiple);today 高亮、disabledDate 与 minDate / maxDate 禁用、weekStartsOn 周起始可配;renderCell / dateCellRender 留口挂事件圆点 / 徽标。\n交互是无障碍网格(role=grid):方向键逐日 / 逐周、PageUp/Down 逐月、Shift+PageUp/Down 逐年、Home/End 本周首尾、Enter/Space 选中,焦点日 roving 且跨月自动翻页。两种尺寸:fullscreen 占满与 compact 紧凑。文案经 Intl 按 locale 本地化,日期数学独立成纯函数内核。',
  controls: [
    {
      type: 'select',
      prop: 'mode',
      label: '模式 mode',
      default: 'single',
      options: [
        { value: 'single', label: 'single 单选' },
        { value: 'range', label: 'range 范围' },
        { value: 'multiple', label: 'multiple 多选' },
      ],
    },
    {
      type: 'select',
      prop: 'size',
      label: '尺寸 size',
      default: 'compact',
      options: [
        { value: 'fullscreen', label: 'fullscreen 占满' },
        { value: 'compact', label: 'compact 紧凑' },
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
      type: 'select',
      prop: 'weekStartsOn',
      label: '周起始 weekStartsOn',
      default: '1',
      options: [
        { value: '0', label: '周日' },
        { value: '1', label: '周一' },
        { value: '6', label: '周六' },
      ],
    },
  ],
  spread: 'div',
};
