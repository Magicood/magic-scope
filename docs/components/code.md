# Code <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

代码原语,行内随文流式 / 块级 pre,四变体 × 七 tone,块级带复制与行号。

> **[在展示站中打开 Code](https://magicood.github.io/magic-scope/#/code)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。

行内默认 `&lt;code&gt;` 随正文流式;block 切到 `&lt;pre&gt;&lt;code&gt;`,保留空白、横向滚动并支持 tabSize。

变体 solid / soft / outline / ghost × tone 走全库 tone resolver(只读 6 槽位,零硬编码配色);size 走流式字阶随密度缩放;mono 等宽字体可关。

块级专属:copyable(剪贴板 + 已复制反馈,文案走 i18n)、lineNumbers(CSS counter,不污染复制内容)。glow 光晕点缀受全局「光影」开关与 reduced-motion 调制。

留口:...rest 透传原生属性与事件;className / style 合并(用户优先);asChild 把样式合并到行内子元素;classNames 定制内层 code 与复制按钮;onCopy 语义回调。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `block` | `boolean` | `false` | 块级渲染:`&lt;pre&gt;&lt;code&gt;` + 保留空白(white-space:pre)+ 横向滚动(overflow-x:auto)。<br>默认 false → 行内 `&lt;code&gt;`(随正文流式)。 |
| `variant` | `"solid" \| "soft" \| "outline" \| "ghost"` | `soft` | 视觉变体:实底 / 柔色 / 描边 / 幽灵。默认 soft(行内/块级都克制不抢眼)。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `neutral` | 语义色调,经全库 tone resolver 派生配色(只读 6 槽位,不写死配色)。默认 neutral。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸档(走 --ms-type-step-* 字阶,随 data-ms-density 缩放)。默认 md。 |
| `mono` | `boolean` | `true` | 等宽字体(--ms-font-mono)。默认 true;设 false 走继承字体(罕见,如展示比例字体代码)。 |
| `tabSize` | `number` | — | Tab 缩进列数(仅块级有意义,映射到 tab-size)。<br>兼容:tab-size 全主流浏览器支持;行内代码通常无制表符,不渲染该属性。 |
| `lineNumbers` | `boolean` | `false` | 行号(仅块级):为每个换行渲染计数槽。需要内容是纯文本/简单结构(按 \n 切行)。<br>兼容:基于 CSS counter,不参与选区复制(复制仍得纯代码)。 |
| `copyable` | `boolean` | `false` | 可复制(仅块级):右上角复制按钮,点击写剪贴板并切换为「已复制」反馈。<br>文案走 i18n(typography.copy / typography.copied)。 |
| `copyText` | `string` | — | 复制内容的显式覆盖。不给时从 children 抽取纯文本。 |
| `copyTimeout` | `number` | `1600` | 复制成功反馈持续毫秒数。默认 1600。 |
| `glow` | `boolean \| "strong" \| "soft"` | — | 发光(text-shadow,受全局 --ms-fx-glow 调制;data-ms-fx=off 时消失)。视觉点缀。 |
| `asChild` | `boolean` | `false` | 渲染为唯一子元素并合并样式/props(Slot 模式;仅非块级、非 copyable 场景)。 |
| `classNames` | `{ code?: string; copy?: string; } \| undefined` | — | 关键子部件 className 映射。 |
| `...props` | `ComponentPropsWithoutRef<'code'>` | — | 透传原生 code 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onCopy` | `(text: string, success: boolean) => void` | 复制完成回调(无论成功与否都触发,带 success 标志,便于上报/toast)。 |

此外透传原生 `<code>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `code` `typography` `inline-code` `code-block` `pre` `monospace` `copy` `clipboard` `syntax` `tone` `magic-glow` |

::: details 需求原文 / 设计意图
代码组件:默认行内 &lt;code&gt;;block 切块级 &lt;pre&gt;&lt;code&gt;(white-space:pre + overflow-x:auto + tabSize)。variant solid/soft/outline/ghost(Radix 式读 tone 槽位)+ tone;块级支持 copyable(走 typography.copy/copied);mono 字体(--ms-font-mono)、size。对标旗舰 Button/Text:tone resolver、发光双降级、forwardRef/...rest/as·asChild/classNames 留口、i18n、strict TS、内容边界。
:::
