# Container <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

居中定宽容器,限宽 + 水平居中 + 响应式内边距,把页面骨架一把收口。

> **[在展示站中打开 Container](https://magicood.github.io/magic-scope/#/container)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-&#42; 变量。

size 提供 sm/md/lg/xl/full 五档(对齐视口断点)或任意自定义长度;fluid 一键满宽。始终 margin-inline:auto 水平居中,内边距用 CSS 逻辑属性(padding-inline / padding-block)RTL 友好,并叠加安全区避刘海裁切。padding / paddingBlock 支持 space token 档与断点对象做响应式;不传 padding 时走流式 clamp 随视口平滑收放。centered 整屏垂直居中。留口:as / asChild 多态、forwardRef 到根、...rest 透传原生属性。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `ContainerSize` | `lg` | 最大行内尺寸档:sm(30rem)/ md(48rem)/ lg(64rem)/ xl(80rem)/ full(不限宽),<br>或任意自定义 CSS 长度(如 '72ch' / '900px')。档位对齐<br>@magic-scope /tokens 的视口断点。默认 lg。 |
| `fluid` | `boolean` | `false` | 满宽:不限制 max-inline-size(等价 size="full")。与 size 同传时 fluid 优先。默认 false。 |
| `padding` | `Responsive<SpaceToken>` | — | 水平内边距(padding-inline,RTL 友好)。接受 space token 档(0..16,映射 --ms-space-&#42;,<br>随密度缩放)或任意 CSS 长度;支持断点对象 `{ base, sm, md, lg, xl }` 做响应式。<br>默认走流式 clamp(随视口收放,无需逐档配置)。 |
| `paddingBlock` | `Responsive<SpaceToken>` | — | 垂直内边距(padding-block)。同 padding 接受 token 档 / CSS 长度 / 断点对象。默认 0。 |
| `centered` | `boolean` | `false` | 垂直居中:容器撑到至少一屏高(min-block-size: 视口高),内容在交叉轴居中。<br>用于落地页 / 空状态等需要内容垂直居中的整屏场景。默认 false。 |
| `as` | `ElementType` | — | 多态渲染标签(语义场景如 section / main / article)。默认 div。 |
| `asChild` | `boolean` | `false` | 渲染为唯一子元素并合并样式/props(Slot 模式;子元素自带内容)。 |
| `children` | `ReactNode` | — | 内容(asChild 时为承载样式的唯一子元素)。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `layout` `container` `wrapper` `responsive` `centered` `max-width` `spacing` `rtl` `polymorphic` |

::: details 需求原文 / 设计意图
新增布局组件 Container：居中定宽容器。size(sm/md/lg/xl/full 或自定义 max-inline-size，映射断点 token 宽度)、自动水平居中(margin-inline:auto)、响应式内边距(padding-inline 随断点、clamp)、centered?(整屏垂直居中)、fluid?(满宽)。多态 as(默认 div，语义场景 section/main)。布局组件为结构性：多态 + asChild、间距 token 化、断点对象响应式、CSS 逻辑属性 RTL 友好；无 tone/发光、无 i18n 文案。
:::
