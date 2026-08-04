# Heading <Badge type="warning" text="draft" /> <Badge type="info" text="v0.0.0" />

语义标题 h1–h6,视觉与语义解耦(level 定标签、variant 定视觉),渐变/光晕/anchor。

> **[在展示站中打开 Heading](https://magicood.github.io/magic-scope/#/heading)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、复用 Text 的字族/tone/字重/对齐/截断/折行能力。

level 定语义标签(h1–h6,可访问性大纲),variant 定视觉档(display/title/subtitle/overline/caption),二者独立(MUI 式)。

标题默认 text-wrap:balance 多行均衡;支持渐变(可 aurora 极光)、光晕(受全局光影开关调制)、permalink anchor(CJK 友好 slug)。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `level` | `1 \| 5 \| 2 \| 3 \| 4 \| 6` | `2` | 语义层级 → 渲染 h1–h6。仅定语义/标签,不直接绑视觉(视觉走 variant)。默认 2。 |
| `variant` | `"caption" \| "title" \| "overline" \| "subtitle" \| "display"` | — | 视觉档(与 level 解耦,MUI 式视觉/语义分离):<br>display 巨标题 / title 标准标题 / subtitle 副标题(弱化)/ overline 全大写上标签 / caption 说明小字。<br>不传时由 level 推导默认视觉档(h1→display、h2→title…),保证「只给 level」也好看。 |
| `as` | `ElementType` | — | 多态:覆盖渲染标签(默认由 level 推导 hN)。语义特殊场景用。 |
| `asChild` | `boolean` | `false` | 渲染为唯一子元素并合并样式/props(Slot 模式;如包裹路由 Link)。 |
| `family` | `"serif" \| "mono" \| "display" \| "sans"` | — | 字族(复用 Text 语义 token)。display=Cinzel 装饰衬线(展示型标题)。不传时 display variant 默认用 display 字族。 |
| `weight` | `number \| TextWeight` | — | 字重:语义档或任意数值(可变字体)。不传由 variant 决定默认。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | — | 语义色调(复用全库 tone resolver 的 --ms-c)。 |
| `color` | `string` | — | 任意 CSS 颜色(直透 color;优先级低于 tone)。 |
| `dimmed` | `boolean` | — | 弱化为次要前景色(fg-muted)。subtitle/caption 常用。 |
| `align` | `"center" \| "end" \| "start" \| "justify"` | — | 文本对齐(逻辑值 start/end,RTL 友好)。 |
| `tracking` | `"normal" \| "tight" \| "tighter" \| "wide" \| "wider" \| "widest"` | — | 字距语义档。overline 默认 wider。 |
| `transform` | `"none" \| "full-width" \| "capitalize" \| "lowercase" \| "uppercase"` | — | 大小写/全角转换。overline 默认 uppercase。 |
| `wrap` | `"balance" \| "nowrap" \| "wrap" \| "pretty"` | `balance` | 折行策略。标题默认 'balance'(text-wrap:balance,多行标题视觉均衡)。<br>兼容:Safari 17.4+/Chrome 114+/FF 121+;旧浏览器自动回退普通换行(渐进增强)。 |
| `truncate` | `boolean` | — | 单行截断(尾部省略)。与 lineClamp 互斥。 |
| `lineClamp` | `number` | — | 多行省略行数。<br>兼容:基于 -webkit-line-clamp;与 truncate 互斥。 |
| `breakWord` | `boolean` | — | 长串/URL 强制断行(overflow-wrap:anywhere),防超长无空格内容撑破。 |
| `gradient` | `boolean \| "tone" \| "aurora"` | — | 渐变文字:true/'tone' 用 tone 槽位渐变;'aurora' 加渐变流动动画(受 motion 档调制)。<br>兼容:基于 background-clip:text,不支持环境自动回退实色。 |
| `glow` | `boolean \| "strong" \| "soft"` | — | 发光文字(text-shadow,受全局 --ms-fx-glow 调制,data-ms-fx=off 时消失)。 |
| `anchor` | `string \| boolean` | — | permalink 锚点(给文档/Prose 用):<br>- `true` → 由标题文本派生可读 slug 作为 id;<br>- 字符串 → 作为显式 id(作者指定 slug)。<br>显式 `id`(原生属性)始终优先。开启后 hover/聚焦标题出现可点 `#` 链接(指向 `#<id>`),<br>键盘可达、读屏可读(aria-label「&lt;文本&gt; 永久链接」)。 |
| `classNames` | `HeadingClassNames` | — | 关键子部件 className 注入口。 |
| `...props` | `ComponentPropsWithoutRef<'h2'>` | — | 透传原生 h2 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<h2>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `heading` `title` `typography` `h1-h6` `semantic` `variant` `anchor` `permalink` `prose` `polymorphic` `gradient` `glow` `balance` `magic` |

::: details 需求原文 / 设计意图
生产级 typography 标题组件。要求:level(1-6) 定语义 hN 标签;variant 视觉档(display/title/subtitle/overline/caption,MUI 式视觉与语义解耦);复用 Text 的 family(display=Cinzel 魔法标题)/tone/weight/align/truncate/lineClamp/wrap(默认 balance 标题均衡)/gradient/glow;新增 anchor(boolean|string)——hover 出现 # permalink 锚点(给文档/Prose 用,带 id + 可点 # 链接,a11y)。内部复用 typography.css token 与 ms-text 同款类。对标旗舰 Button/Input/Text 的留口范式(forwardRef/...rest 透传/as/asChild/classNames/composeEventHandlers)。
:::
