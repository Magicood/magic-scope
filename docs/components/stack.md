# Stack <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

一维堆叠原语,纵/横向 + 间距 token + 对齐 + 分布 + 换行,全部支持断点响应式。

> **[在展示站中打开 Stack](https://magicood.github.io/magic-scope/#/stack)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

flex 实现的有主张布局原语:direction / gap / align / justify / wrap 均可传「断点对象」做响应式;

另有 divider 子项间插、recursive 交替方向、inline 行内、多态 as 与 asChild Slot。自研零依赖,消费 @magic-scope/tokens 的 --ms-space-&#42; 间距 token。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `as` | `ElementType` | — | 多态根标签。默认 div。 |
| `asChild` | `boolean` | `false` | 渲染为唯一子元素(Radix Slot 风格):把 Stack 的 class / style / 事件合并进子元素,<br>不额外包一层 DOM。子元素需自带内容,且只能有一个。与 divider 互斥(无内部容器可间插)。 |
| `direction` | `Responsive<StackDirection>` | `vertical` | 堆叠方向(响应式)。vertical 纵向(默认)\| horizontal 横向。 |
| `gap` | `Responsive<SpaceToken>` | `4` | 子项间距档(响应式),映射 --ms-space-&#42;;0 = 无间距。默认 4(1rem)。 |
| `align` | `Responsive<StackAlign>` | `stretch` | 交叉轴对齐(响应式)。横向时控制竖直对齐,纵向时控制水平对齐。默认 stretch。 |
| `justify` | `Responsive<StackJustify>` | `start` | 主轴分布(响应式)。默认 start。 |
| `wrap` | `Responsive<StackWrap>` | `nowrap` | 换行(响应式)。默认 nowrap。 |
| `inline` | `boolean` | `false` | 行内堆叠(inline-flex),让 Stack 随内容收缩、可并排于文本流。默认 false。 |
| `divider` | `ReactNode` | — | 在相邻子项之间插入分隔元素(如 &lt;Divider /&gt; 或任意 ReactNode)。<br>用 Children 间插实现,分隔元素继承 Stack 方向(横向 Stack 给竖直分隔线)。<br>asChild 时忽略(无内部容器)。 |
| `recursive` | `boolean` | `false` | 递归反向:直接子 Stack 自动取相反方向(纵向父 → 横向子,反之亦然),<br>便于零配置搭出「行内套列、列内套行」的交替栅格。仅作用于直接子 Stack。默认 false。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `layout` `stack` `flex` `vstack` `hstack` `spacing` `responsive` `divider` `polymorphic` `rtl` |

::: details 需求原文 / 设计意图
原创布局原语。定位:有主张的一维堆叠(对标 Radix Flex / Chakra Stack / MUI Stack 的纵横堆叠),作为本库 layout 分类首个落地组件,沉淀「断点对象 → CSS 变量 + 静态 @media 级联」的响应式范式供 Flex/Grid 平移。需求要点:direction(vertical 默认 | horizontal,响应式)、gap(token 档,响应式)、align(start/center/end/stretch/baseline)、justify、wrap、inline;divider 子项间插;recursive 子 Stack 自动反向;flex 实现;多态 as 默认 div + asChild。布局组件为结构性,无 tone/发光,但要多态、响应式、间距 token 化、RTL 友好(逻辑属性 + gap)。
:::
