import type { ComponentMeta } from '../core/types';

export const meta: ComponentMeta = {
  id: 'grid',
  name: 'Grid',
  category: 'layout',
  summary:
    'CSS Grid 布局原语,columns/gap/对齐全经 CSS 变量驱动,支持 minChildWidth 自适应列、容器查询与断点对象响应式。',
  description:
    '自研、零依赖的 CSS Grid 容器,消费 @magic-scope/tokens 的 --ms-* 间距变量。\ncolumns 接受「数字(等宽 repeat) / 模板字符串(如 "1fr auto 2fr") / 断点对象」;minChildWidth 提供时切换为 auto-fit 自适应列、放不下自动折行(优先级高于 columns)。\ngap / rowGap / columnGap、align / justify、alignContent / justifyContent、autoFlow(含 dense 回填) / autoRows / autoColumns 均支持「单值或断点对象」响应式;响应式由预展开的静态 @media 块逐级覆盖(条件里 var() 不生效故每断点一个变量)。\ncontainer 开启后改用 @container 对父容器宽度自适应而非视口;多态 as(默认 div)+ asChild + forwardRef + 透传原生属性。配套 Grid.Item 做子项级 colSpan / rowSpan / colStart / rowStart 与 alignSelf / justifySelf。',
  controls: [
    {
      type: 'number',
      prop: 'columns',
      label: '列数 columns',
      default: 3,
      min: 1,
      max: 6,
      step: 1,
    },
    {
      type: 'select',
      prop: 'gap',
      label: '间距 gap',
      default: '4',
      options: [
        { value: '0', label: '0' },
        { value: '2', label: '2' },
        { value: '4', label: '4' },
        { value: '6', label: '6' },
        { value: '8', label: '8' },
      ],
    },
    {
      type: 'select',
      prop: 'align',
      label: '子项块向对齐 align',
      default: 'stretch',
      options: [
        { value: 'stretch', label: 'stretch 拉伸' },
        { value: 'start', label: 'start 起始' },
        { value: 'center', label: 'center 居中' },
        { value: 'end', label: 'end 末尾' },
      ],
    },
    {
      type: 'select',
      prop: 'justify',
      label: '子项行向对齐 justify',
      default: 'stretch',
      options: [
        { value: 'stretch', label: 'stretch 拉伸' },
        { value: 'start', label: 'start 起始' },
        { value: 'center', label: 'center 居中' },
        { value: 'end', label: 'end 末尾' },
      ],
    },
    { type: 'boolean', prop: 'inline', label: '行内 inline', default: false },
  ],
  spread: 'div',
  alsoProps: ['Grid.Item'],
};
