# Link <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

内联超链接,下划线四态、tone 着色、外链一键安全化与禁用模拟。

> **[在展示站中打开 Link](https://magicood.github.io/magic-scope/#/link)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

真正的 &lt;a&gt; 原语,把链接的交互/语义/装饰收成 props。

下划线四态(auto/hover/always/none)、语义 tone 着色(默认走专用链接角色色)、字号档继承上下文;external 自动补 target=_blank + rel="noopener noreferrer" + 外链图标 + sr-only 新窗口提示;disabled 以「去 href + aria-disabled + 拦截点击」综合模拟,读屏仍报为被禁用链接。muted 次级、glow 微光光晕、asChild 多态(路由 Link)。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `underline` | `"none" \| "auto" \| "hover" \| "always"` | `auto` | 下划线策略(Radix 式四态):<br>- `auto`(默认):静止有下划线、hover 去掉(经典正文内联链接);<br>- `hover`:静止无、hover 才出现;<br>- `always`:始终有;<br>- `none`:从不。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | — | 语义色调,经全库 tone resolver 派生(读 --ms-c)。<br>不传时走专用的链接角色色 --ms-color-link(回退 --ms-color-primary),符合「链接 ≠ 主色按钮」的语义。 |
| `size` | `"base" \| "inherit" \| "sm" \| "lg" \| "xl" \| "xs"` | `inherit` | 字号档(走 --ms-type-step-*)。默认 inherit —— 内联链接应继承上下文字号。 |
| `external` | `boolean` | `false` | 外链:补 target=_blank + rel="noopener noreferrer" + 尾随外链图标 +<br>sr-only 的「在新窗口打开」提示(i18n: link.newWindow)。<br>用户显式给 target/rel 时尊重并安全合并(见 logic.mergeRel)。 |
| `hideExternalIcon` | `boolean` | `false` | 隐藏外链图标(仍保留 target/rel 与 sr-only 提示)。external 为 false 时无意义。 |
| `externalIcon` | `ReactNode` | — | 自定义外链图标(覆盖默认箭头图标);仅 external 时渲染。 |
| `disabled` | `boolean` | `false` | 禁用:&lt;a&gt; 无原生 disabled —— 用「去 href + aria-disabled + tabIndex=-1 + 拦截点击」综合模拟,<br>读屏仍报为被禁用的链接。视觉降透明度、去交互反馈。 |
| `muted` | `boolean` | `false` | 弱化为次要前景色(fg-muted),hover 才点亮到链接色。用于面包屑/页脚等次级链接。<br>与 tone 互斥语义:给了 tone 以 tone 为准。 |
| `glow` | `"off" \| "hover" \| "always"` | `off` | 微光效果(text-shadow,受全局 --ms-fx-glow 与 motion 调制):off / 仅 hover / 常亮。默认 off。 |
| `leftIcon` | `ReactNode` | — | 前置图标(图标在文字前,随链接色);务必是装饰性内容(aria-hidden)。 |
| `asChild` | `boolean` | `false` | 多态渲染:把 Link 的样式/props 合并到唯一子元素(Slot 模式),用于路由库的 &lt;Link&gt;。<br>事件 compose、ref 合并,子元素自带 href/内容。 |
| `classNames` | `{ icon?: string; externalIcon?: string; } \| undefined` | — | 子部件 className 映射(图标/外链图标),给进阶用户精细定制。 |
| `...props` | `ComponentPropsWithoutRef<'a'>` | — | 透传原生 a 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

此外透传原生 `<a>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `link` `anchor` `typography` `external-link` `underline` `tone` `as-child` `polymorphic` `disabled` `a11y` `magic-glow` `i18n` |

::: details 需求原文 / 设计意图
用户 2026-06-26 定:typography 分类补内联链接 Link。要求生产级深度对标旗舰 Button/Input/Text。核心契约:underline 四态走 Radix 式(auto/hover/always/none);tone 默认走链接角色色 --ms-color-link(读 tone 槽位差异化),不写死 primary;external → target=_blank + rel=noopener noreferrer + 外链图标 + sr-only link.newWindow 文案(i18n,已登记);asChild 走 mergeAsChildProps + composeRefs 接路由 Link;disabled 用 aria-disabled + 去交互模拟(&lt;a&gt; 无原生 disabled);hover 微光受 motion 降级。严格遵循已立标准:留口(forwardRef/...rest/asChild/ReactNode 槽/classNames)、事件 composeEventHandlers 合并不覆盖、i18n 不写死中文、内容边界(长 URL 不撑破)、strict TS(exactOptionalPropertyTypes / noUncheckedIndexedAccess)、纯逻辑放 logic.ts。兼容性备注:link-active/visited token 缺失时三级回退,不强加颜色。
:::
