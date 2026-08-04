# List <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

列表排版,无序 / 有序 / 描述三态,原生与自定义标记、tone 着色与光晕效果一把收口。

> **[在展示站中打开 List](https://magicood.github.io/magic-scope/#/list)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

一个 props 把三种语义列表(ul / ol / dl)、原生 ::marker 与自定义节点标记、间距密度、tone 着色、光晕效果全收口。

子部件走命名空间:List.Item(li)/ List.Term(dt)/ List.Detail(dd)。嵌套时子列表标记与间距独立(CSS 不向下穿透),天然形成层级缩进。glow 受全局「光影」开关调制。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `"ordered" \| "description" \| "unordered"` | `unordered` | 语义形态:unordered→ul / ordered→ol / description→dl。默认 unordered。 |
| `marker` | `string \| number \| bigint \| boolean \| ReactElement<unknown, string \| JSXElementConstructor<any>> \| Iterable<ReactNode> \| ... 4 more ...` | — | 标记:传 list-style-type 字符串(disc / decimal / lower-roman…)走原生 ::marker;<br>传 ReactNode 则每项用该节点作自定义标记(list-style:none + 自绘标记列)。<br>不传时按 variant 兜底(unordered=disc / ordered=decimal / description=none)。 |
| `spacing` | `"none" \| "sm" \| "md" \| "lg" \| "xs"` | `md` | 间距档(行距,随密度 --ms-density-scale 缩放)。默认 md。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | — | 语义色调(着色 ::marker 与自定义标记;复用 tone resolver 的 --ms-c)。 |
| `glow` | `boolean` | — | 标记发光(text-shadow,受全局 --ms-fx-glow 调制;data-ms-fx=off 时消失)。 |
| `markerPosition` | `"inside" \| "outside"` | `outside` | 标记位置:outside(默认,标记在内容框外)/ inside(标记随首行内嵌)。 |
| `as` | `ElementType` | — | 多态渲染标签(覆盖 variant 推导的标签;少见,如语义化为 nav&gt;ul 的内层)。 |
| `asChild` | `boolean` | `false` | 渲染为唯一子元素并合并样式/props(Slot 模式)。 |
| `classNames` | `ListClassNames` | — | 关键子部件 className 注入。 |
| `markerNode` | `ReactNode` | — | 自定义标记节点(由 List 在 marker 为 ReactNode 时注入;也可单项覆盖)。 |
| `markerClassName` | `string` | — | 自定义标记容器 className(由 List 的 classNames.marker 注入)。 |
| `...props` | `ComponentPropsWithoutRef<'ul'>` | — | 透传原生 ul 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<ul>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `list` `typography` `unordered` `ordered` `description-list` `marker` `ul` `ol` `dl` `nested` `tone` `density` `polymorphic` `asChild` |

::: details 需求原文 / 设计意图
生产级 typography 列表组件。variant: unordered|ordered|description → 渲染 ul/ol/dl;marker?: list-style-type(disc/circle/decimal/lower-roman…)或 icon ReactNode 自定义标记;spacing 档(随密度 --ms-density-scale);tone(::marker 着色读 --ms-c);List.Item 子部件(命名空间 List.Item);description 变体支持 term/detail。嵌套友好。对标旗舰 Text/Button/Input:多态 as/asChild、...rest 透传、classNames 注入子部件、魔法 glow 双降级、内容边界不撑破、strict TS。
:::
