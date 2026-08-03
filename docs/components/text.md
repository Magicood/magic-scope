# Text <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

文字排版旗舰原语,多态 as,全字号/字重/字距,渐变/光晕/描边与入场动效。

> **[在展示站中打开 Text](https://magicood.github.io/magic-scope/#/text)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

把「所有可控文字属性」收成 props:字族/字号/字重/斜体、tone 着色、对齐/行高/字距、装饰/transform、截断(单行+多行)、折行/空白/断词/方向、数字变体/小型大写。

视觉层:gradient(tone / aurora 极光)、glow(光晕)、stroke(描边镂空),受全局「光影」开关调制。动效层:reveal 上浮 / blur-in 模糊聚焦 / shimmer 高光 / pulse 呼吸 / flow 渐变流动,受 data-ms-motion 与 prefers-reduced-motion 调制,关闭时降级为静态。

多态:as 切任意标签、asChild 合并到子元素;...rest 透传所有原生属性与事件。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `as` | `ElementType` | — | 多态渲染标签(默认 span)。语义场景按需 p/strong/em/label 等。 |
| `asChild` | `boolean` | `false` | 渲染为唯一子元素并把样式/props 合并上去(Slot 模式;如包裹路由 Link)。 |
| `family` | `"serif" \| "mono" \| "display" \| "sans"` | — | 字族(语义 token,不暴露字体栈)。display=Cinzel 装饰衬线(展示型标题)。 |
| `size` | `"base" \| "sm" \| "lg" \| "xl" \| "2xl" \| "xs" \| "3xl" \| "4xl" \| "5xl"` | — | 字号档(走 --ms-type-step-* 流式字阶)。 |
| `weight` | `number \| TextWeight` | — | 字重:语义档或任意数值(可变字体)。 |
| `italic` | `boolean` | — | 斜体。 |
| `color` | `string` | — | 任意 CSS 颜色(直透 color;优先级低于 tone)。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | — | 语义色调(复用全库 tone resolver 的 --ms-c)。 |
| `dimmed` | `boolean` | — | 弱化为次要前景色(fg-muted)。 |
| `align` | `"center" \| "end" \| "start" \| "justify"` | — | 文本对齐(逻辑值 start/end,RTL 友好)。 |
| `leading` | `"none" \| "normal" \| "loose" \| "tight" \| "snug" \| "relaxed"` | — | 行高语义档。 |
| `tracking` | `"normal" \| "tight" \| "tighter" \| "wide" \| "wider" \| "widest"` | — | 字距语义档(em 随字号缩放)。 |
| `transform` | `"none" \| "full-width" \| "capitalize" \| "lowercase" \| "uppercase"` | — | 大小写/全角转换。 |
| `underline` | `boolean` | — | 下划线。 |
| `strikethrough` | `boolean` | — | 删除线。 |
| `truncate` | `boolean \| "end" \| "start"` | — | 截断:true/'end' 单行尾部省略;'start' 头部省略(用 direction 技巧)。<br>兼容:'start' 截断依赖 direction:rtl 翻转,内含西文+数字时方向感可能反直觉。 |
| `lineClamp` | `number` | — | 多行省略行数。<br>兼容:基于 -webkit-line-clamp(需 display:-webkit-box),Chrome/Safari/FF 现代版均支持;<br>与 padding-bottom 同用时末行可能透出;无法与 'start' 截断叠加。 |
| `wrap` | `"balance" \| "nowrap" \| "wrap" \| "pretty"` | — | 折行策略。<br>兼容:'balance'(均衡标题行)/'pretty'(避免孤字)= text-wrap,Safari 17.4+/Chrome 114+/FF 121+;<br>旧浏览器自动回退普通换行(渐进增强,无副作用)。 |
| `whitespace` | `"pre" \| "normal" \| "nowrap" \| "break-spaces" \| "pre-line" \| "pre-wrap"` | — | 空白处理(pre/pre-wrap 保留换行与缩进,代码/预格式文本用)。 |
| `breakWord` | `boolean` | — | 长串/URL 强制断行(overflow-wrap:anywhere)。 |
| `hyphens` | `boolean` | — | 西文连字符断词(hyphens:auto)。<br>兼容:需配合元素/祖先的 lang 属性才生效;CJK 无意义。Safari 走 -webkit-hyphens(已加)。 |
| `dir` | `"auto" \| "ltr" \| "rtl"` | — | 文本方向(写入原生 dir;auto 由内容首个强方向字符决定,适合用户生成内容防 bidi 串位)。 |
| `numeric` | `"slashed-zero" \| "tabular" \| "oldstyle" \| "lining" \| "proportional"` | — | 数字变体(tabular=等宽数字,表格/价格对齐必备)。<br>兼容:依赖字体含对应 OpenType 特性,缺失时静默回退默认数字。 |
| `smallCaps` | `boolean` | — | 小型大写(font-variant-caps,优于 text-transform 因保留字形设计)。 |
| `selectable` | `boolean` | — | 是否可选中(false → user-select:none)。 |
| `gradient` | `boolean \| "tone" \| "aurora"` | — | 渐变文字:true/'tone' 用 tone 槽位渐变;'aurora' 加渐变流动动画(受 motion 档调制)。<br>兼容:基于 background-clip:text(+ -webkit- 前缀),广泛支持;<br>  不支持环境(@supports 检测)自动回退为 tone 实色,绝不透明裸奔。 |
| `glow` | `boolean \| "strong" \| "soft"` | — | 发光文字(text-shadow,受全局 --ms-fx-glow 调制,data-ms-fx=off 时消失)。 |
| `stroke` | `boolean` | — | 描边/镂空文字(-webkit-text-stroke)。<br>兼容:-webkit-text-stroke 非标准但全主流浏览器(含 FF)支持;镂空态注意对比度。 |
| `animate` | `"flow" \| "pulse" \| "shimmer" \| "reveal" \| "blur-in"` | — | 动效:reveal 上浮淡入 / blur-in 模糊聚焦入场;shimmer 渐变扫过 / pulse 发光呼吸 /<br>flow 渐变流动(持续)。全部受全局 data-ms-motion 与 prefers-reduced-motion 调制,<br>关闭时自动降级为静态(入场态直接呈现、不卡在隐藏)。shimmer/pulse/flow 复用 tone 槽位。 |
| `writingMode` | `"horizontal" \| "vertical"` | — | 书写方向:vertical=竖排(CJK 古籍 / 侧栏标签)。<br>兼容:writing-mode 全主流浏览器支持;竖排下西文与标点会旋转,按需配 text-orientation(逃生舱)。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-25 |
| 标签 | `text` `typography` `polymorphic` `as-child` `truncate` `line-clamp` `gradient-text` `magic-motion` `vertical-text` `tone` `tabular-nums` `rtl` |

::: details 需求原文 / 设计意图
用户 2026-06-25 定:文字排版单独成 typography 分类(与 layout 并列),尽量全覆盖所有可支持文字属性,并给足用户发挥空间(插槽/多态/全事件/可定制)、透明备注兼容性。Text 为该分类旗舰核心:多态文字原语承载全属性矩阵 + 魔法文字差异化(复用 tone/fx/动效档)。共享尺度走 typography.css 的 --ms-type-step-*/--ms-leading-*/--ms-tracking-*(组件内兜底,待架构线接入正式 type scale)。兼容性坑(text-wrap/line-clamp/background-clip:text/hyphens/text-stroke)逐条标注在 prop TSDoc,不藏着。
:::
