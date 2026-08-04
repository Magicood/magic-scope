# Prose <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

富文本 / HTML 内容容器排版,一键给整块 markdown/CMS 内容套上全库排版规范。

> **[在展示站中打开 Prose](https://magicood.github.io/magic-scope/#/prose)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

组件本体极轻:多态 as / asChild + className / classNames + children,真正的重头在 Prose.css —— 用后代选择器为 .ms-prose 内的 h1-h6 / p / ul / ol / li / blockquote / code / pre / a / hr / table / img 等统一排版,字号阶梯走 --ms-type-step-&#42;、正文行距 --ms-leading-&#42;、链接与列表标记走 tone 槽位,全部消费 --ms-&#42; token 并随 data-ms-density 缩放。

size 三档只调正文基准字号,其余元素以 em 相对推导,缩放时层级关系恒定;不内置 dangerouslySetInnerHTML,是否信任 HTML 的安全决策交还调用方。内容边界稳健:超长 code/URL 不撑破(pre 横滚、行内长串断行、表格可横滚)。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `as` | `ElementType` | — | 多态渲染标签。默认 div;语义场景按需 article / section / main 等。 |
| `asChild` | `boolean` | `false` | 渲染为唯一子元素并把 prose 类与 props 合并上去(Slot 模式),<br>用于已经存在的容器(如把排版套到外部布局节点)上而不额外包一层 DOM。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 整体字号档(sm 紧凑 / md 默认 / lg 阅读放大),通过基准字号驱动全部子元素相对缩放。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 链接 / 强调 / 引用条等点缀色调,复用全库 tone resolver 的槽位变量。默认 primary。 |
| `classNames` | `{ root?: string; }` | — | 细粒度 classNames 槽位:`root` 拼到根节点。<br>(Prose 子元素由 HTML 内容动态生成,无法逐元素挂类,故只暴露根槽位;<br>需要逐元素定制时直接用后代选择器覆写 `.ms-prose <tag>`。) |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `prose` `typography` `rich-text` `html` `markdown` `content` `article` `mdx` |

::: details 需求原文 / 设计意图
需要一个轻量容器把外部来源的成块 HTML/JSX(markdown 渲染结果、CMS 富文本、MDX 文档)一键套上整套排版规范,无需为每个元素手写类。组件本体只负责多态渲染与留口(as/asChild/className/classNames),排版规则全部沉到 Prose.css 的后代选择器并消费 --ms-&#42; token、随 data-ms-density 缩放、用 tone 槽位着色链接/引用/列表标记。安全决策(是否 dangerouslySetInnerHTML)交还调用方,不内置注入。size 三档只调正文基准字号、其余元素以 em 相对推导,保证整体缩放时层级关系恒定。
:::
