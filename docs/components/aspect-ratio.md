# AspectRatio <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

宽高比盒,用 CSS aspect-ratio 维持任意比例,子媒体绝对铺满并可裁剪。

> **[在展示站中打开 AspectRatio](https://magicood.github.io/magic-scope/#/aspect-ratio)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-&#42; 变量。

用 CSS `aspect-ratio` 维持任意宽高比;不支持的旧引擎经 `@supports` 自动回退 padding-top 百分比技巧,行为一致。

能力:`ratio` 支持数字 / 比值字符串 / 断点对象(`{ base, sm, md, lg, xl, 2xl }`,纯静态 @media 渐进切换,零运行时);`objectFit` / `objectPosition` 透到子媒体;`rounded` 圆角档 + `clip` 裁剪;多态 `as` 与 `asChild`(Slot 风格)。

留口:`...rest` 透传所有原生属性与事件,`className` / `style` 与计算值合并(用户 style 优先),`forwardRef` 到根元素。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `as` | `ElementType` | — | 多态渲染标签。默认 `div`;语义场景可换 `figure`(配 figcaption)/ `section` 等。<br>与 `asChild` 互斥(asChild 优先),`as` 在非 asChild 时生效。 |
| `ratio` | `ResponsiveRatio` | `16 / 9` | 宽高比。支持:<br>- 数字:`16 / 9`、`1`、`4 / 3`(直接写算式即可,JS 求值后传入);<br>- 字符串:`"16/9"` / `"16 / 9"`(CSS 原生比值);<br>- 断点对象:`{ base: 1, md: 16 / 9, lg: 21 / 9 }`,按视口断点切换(min-width 渐进覆盖)。<br><br>用 CSS `aspect-ratio` 维持比例;不支持 `aspect-ratio` 的旧引擎自动回退 padding-top 百分比技巧。<br>默认 `16 / 9`。非法值(NaN / &lt;=0)被忽略并回退默认。 |
| `children` | `ReactNode` | — | 子内容(通常是 `img` / `video` / `iframe` / `picture`):被绝对定位铺满整个比例盒。<br>媒体元素的 `object-fit` 由 `objectFit` 控制;非媒体内容(如叠加层)也会被拉满,可自行用 inset 调整。 |
| `objectFit` | `"none" \| "fill" \| "cover" \| "contain" \| "scale-down"` | `cover` | 子媒体的填充方式(映射到子内容 `object-fit`)。<br>`cover`(默认,裁剪铺满不留边) / `contain`(完整可见可能留边) / `fill` / `none` / `scale-down`。<br>备注:`object-fit` 仅对替换元素(img/video 等)生效;普通块级子元素请用自身布局。 |
| `objectPosition` | `string` | — | 子媒体的对齐焦点(映射到子内容 `object-position`,逻辑同 CSS,如 `"center"` / `"top"` / `"50% 25%"`)。<br>仅在 `objectFit` 为 cover / contain / scale-down 时有可见效果。 |
| `rounded` | `"none" \| "sm" \| "md" \| "lg" \| "xl" \| "full"` | `none` | 圆角档(映射到 `--ms-radius-*`):`none` / `sm` / `md` / `lg` / `xl` / `full`。<br>设置后自动 `overflow: hidden`,让裁剪的媒体跟随圆角。默认不裁剪(none)。 |
| `clip` | `boolean` | — | 是否裁剪溢出内容(`overflow: hidden`)。设了 `rounded`(非 none)时默认 true。<br>显式传入可覆盖(如需让媒体的阴影/控件溢出可见时设 false)。 |
| `asChild` | `boolean` | `false` | 渲染为子元素并保留比例盒样式(Radix Slot 风格;由子元素自带内容)。与 `as` 互斥,asChild 优先。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

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
