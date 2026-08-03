# Breadcrumb <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

面包屑导航,语义化 nav/ol 结构,自动把末项识别为当前页。

> **[在展示站中打开 Breadcrumb](https://magicood.github.io/magic-scope/#/breadcrumb)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。

结构为 &lt;nav aria-label="breadcrumb"&gt; → &lt;ol&gt; → &lt;li&gt;:非当前项有 href 渲染 &lt;a&gt;(link 色 + hover 微光),无 href 渲染静态文本,当前项渲染 &lt;span aria-current="page"&gt;(fg 色、不可点)。

分隔符为装饰性元素(aria-hidden),屏幕阅读器忽略;末项未显式标 current 时按"末项即当前页"处理。label 可为任意节点(如带图标)。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/breadcrumb.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` * | `BreadcrumbItem[]` | — | 面包屑层级项,自前往后。 |
| `separator` | `ReactNode` | `/` | 项间分隔符,装饰性(aria-hidden)。默认 "/"。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `neutral` | 语义色调,接 tone 槽位(链接 / hover 微光 / 分隔符)。默认 neutral。 |
| `ariaLabel` | `string` | — | 覆盖 &lt;nav&gt; 的 aria-label;不传则走字典 breadcrumb.nav(默认「面包屑」)。 |
| `maxItems` | `number` | — | 超过该数量则折叠中间项为可展开的省略号(…)。`0`/未设视为不折叠。<br>折叠时保留头 itemsBeforeCollapse 项、尾 itemsAfterCollapse 项。 |
| `itemsBeforeCollapse` | `number` | `1` | 折叠时头部保留的条目数。默认 1。 |
| `itemsAfterCollapse` | `number` | `1` | 折叠时尾部保留的条目数。默认 1。 |
| `linkAs` | `ElementType` | — | 自定义链接元素(替换 &lt;a&gt;):接入 React Router / Next 时传 Link。<br>仅作用于「有 href 的非当前项」;href 会作为该元素的 props 透传。 |
| `itemRender` | `((item: BreadcrumbItem, state: BreadcrumbItemState) => ReactNode)` | — | 全局自定义单项渲染(item.render 优先级更高):返回节点完全替换默认渲染。<br>适合统一接路由库;拿到 isCurrent 决定渲染 &lt;Link&gt; 还是当前页文本。 |
| `classNames` | `BreadcrumbClassNames` | — | 关键子部件类名钩子。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onItemClick` | `(item: BreadcrumbItem, index: number, event: MouseEvent<Element, MouseEvent>) => void` | 任意项链接点击时回调(item.onClick 之后触发,二者都会调):<br>委托式 SPA 拦截入口,`e.preventDefault()` 阻止默认跳转。<br>· `item` — 被点击的项数据<br>· `index` — 该项在原始 items 中的下标<br>· `event` — 原生鼠标点击事件(可 preventDefault 拦截默认跳转) |

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-25 |
| 标签 | `navigation` `breadcrumb` `nav` `link` `dark` `arcane` `tone` `collapse` `router` `i18n` `a11y` |

::: details 需求原文 / 设计意图
面包屑导航:nav&gt;ol&gt;li 结构,链接项用 link 色加 hover 微光,当前项 aria-current="page" 用 fg 色不可点,项间插装饰性分隔符。工程要求(magic-scope 结构/导航组件):自研、消费 tokens,完整状态、键盘可达、fx/motion 开关、逻辑属性。
:::
