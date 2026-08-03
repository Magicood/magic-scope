# Blockquote <Badge type="warning" text="draft" /> <Badge type="info" text="v0.0.0" />

块级引用,四种视觉变体 × 语义色调 × 三档尺寸,带出处槽与装饰大引号、渐变强调条/光晕。

> **[在展示站中打开 Blockquote](https://magicood.github.io/magic-scope/#/blockquote)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

语义 &lt;blockquote&gt; 原语:左强调条读全库 tone 槽位(--ms-c)、柔底读 --ms-c-soft。

变体(bordered / filled / card / plain)× tone × size;出处槽(&lt;footer&gt;&lt;cite&gt;)、图标/装饰大引号槽,以及渐变强调条与光晕(受顶栏「光影」开关双降级)。as / asChild 多态,citeUrl 写入原生 blockquote&#91;cite]。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `as` | `ElementType` | — | 多态根标签。默认 blockquote(语义最佳)。可换 figure 等。 |
| `asChild` | `boolean` | `false` | 渲染为唯一子元素并把样式/props 合并上去(Slot 模式,如包裹自定义容器)。 |
| `variant` | `"bordered" \| "filled" \| "card" \| "plain"` | `bordered` | 视觉变体:左强调条 / 柔底块 / 卡片 / 纯文字。默认 bordered。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | — | 语义色调(复用全库 tone resolver 的 --ms-c / --ms-c-soft / --ms-c-glow)。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(字号走 --ms-type-step-*、行高走 --ms-leading-*)。默认 md。 |
| `accentSide` | `"end" \| "start"` | `start` | 强调条/缩进所在侧(逻辑值,RTL 友好)。默认 start。 |
| `cite` | `ReactNode` | — | 出处槽:渲染为 &lt;footer&gt;&lt;cite&gt;…&lt;/cite&gt;&lt;/footer&gt;(语义出处)。 |
| `citeUrl` | `string` | — | 引文来源 URL,写入真实 blockquote 的原生 cite 属性(机器可读出处)。 |
| `icon` | `ReactNode` | — | 图标/引号槽:自定义前置图标(覆盖 quoteMark 装饰)。 |
| `quoteMark` | `string \| boolean` | `false` | 装饰大引号:true 显示默认引号字形,可传字符串自定义引号字符。默认 false。 |
| `gradient` | `boolean` | `false` | 渐变强调条(tone → glow,基于 background;不支持环境回退实色)。 |
| `glow` | `"strong" \| "off" \| "soft"` | `off` | 强调条/底块发光(受全局 --ms-fx-glow 调制,data-ms-fx=off 时消失)。默认 off。 |
| `classNames` | `BlockquoteClassNames` | — | 子部件 class 覆盖。 |
| `...props` | `ComponentPropsWithoutRef<'blockquote'>` | — | 透传原生 blockquote 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

此外透传原生 `<blockquote>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `blockquote` `quote` `引用` `出处` `cite` `typography` `tone` `magic` `accent` |

::: details 需求原文 / 设计意图
块级引用 typography 组件:语义 &lt;blockquote&gt;,出处(footer/cite 或 cite 属性)、引号/自定义图标槽、tone(左强调条读 --ms-c、柔底 --ms-c-soft)、variant、size,复用 typography.css 行高/字号。对标旗舰 Text/Button:多态 as/asChild、tone resolver 6 槽位、魔法渐变/发光 + prefers-reduced-motion 与 data-ms-motion=off 双降级、forwardRef + 全 rest 透传 + classNames 子部件映射、内容边界不撑破、strict TS。
:::
