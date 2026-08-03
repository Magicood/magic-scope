# AspectRatio <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

宽高比盒,用 CSS aspect-ratio 维持任意比例,子媒体绝对铺满并可裁剪。

> **[在展示站中打开 AspectRatio](https://magicood.github.io/magic-scope/#/aspect-ratio)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。

用 CSS `aspect-ratio` 维持任意宽高比;不支持的旧引擎经 `@supports` 自动回退 padding-top 百分比技巧,行为一致。

能力:`ratio` 支持数字 / 比值字符串 / 断点对象(`{ base, sm, md, lg, xl, 2xl }`,纯静态 @media 渐进切换,零运行时);`objectFit` / `objectPosition` 透到子媒体;`rounded` 圆角档 + `clip` 裁剪;多态 `as` 与 `asChild`(Slot 风格)。

留口:`...rest` 透传所有原生属性与事件,`className` / `style` 与计算值合并(用户 style 优先),`forwardRef` 到根元素。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `layout` `aspect-ratio` `media` `responsive` `image` `video` `iframe` `object-fit` `polymorphic` `as-child` |

::: details 需求原文 / 设计意图
新布局组件 AspectRatio:宽高比盒。ratio(number 如 16/9、1、4/3)用 CSS aspect-ratio 维持比例,子内容(img/video/iframe)绝对填满(object-fit:cover 可选)。@supports 兜底用 padding-top 百分比技巧。ratio 支持响应式对象。多态 as + asChild。布局组件为结构性:多态、响应式、间距 token 化、RTL 友好,不需要 tone/发光。
:::
