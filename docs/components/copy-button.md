# CopyButton <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

复制按钮,点击写入剪贴板并进入「已复制」反馈态(图标切对勾 + 可选 Tooltip),超时自动还原。

> **[在展示站中打开 CopyButton](https://magicood.github.io/magic-scope/#/copy-button)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

高频「一键复制」场景(token / 命令 / 分享链接)的开箱即用按钮:点击即写剪贴板,给出明确即时反馈。

复制成功后图标从复制图标切到对勾、可选 Tooltip 提示「已复制」,timeout(默认 1500ms)后自动还原;复用 Button 的 tone / size / variant 与 Tooltip,不另起一套样式。

剪贴板写入做特性检测降级:优先 navigator.clipboard.writeText(需安全上下文),回退 document.execCommand。a11y:aria-label 随状态切换并经 aria-live 播报。

留口:render-prop children (copied) =&gt; ReactNode、icon / copiedIcon 覆盖图标、onCopy / onError 回调。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` * | `string` | — | 要写入剪贴板的文本。 |
| `timeout` | `number` | `1500` | 进入「已复制」反馈态后自动还原的毫秒数。默认 1500。 |
| `icon` | `ReactNode` | — | 覆盖默认「复制」图标。 |
| `copiedIcon` | `ReactNode` | — | 覆盖默认「已复制」(对勾)图标。 |
| `children` | `CopyButtonChildren` | — | 自定义内容:普通节点,或 `(copied) =&gt; ReactNode` 按状态渲染(默认仅图标)。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info"` | `primary` | 语义色调(复用 Button 的 tone resolver)。默认 primary。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(随 data-ms-density 缩放,复用 Button)。默认 md。 |
| `variant` | `"link" \| "solid" \| "soft" \| "outline" \| "ghost"` | `soft` | 视觉变体(复用 Button)。默认 soft。 |
| `withTooltip` | `boolean` | `true` | 是否用 Tooltip 显示「复制 / 已复制」提示。默认 true。 |
| `tooltipPlacement` | `"left" \| "right" \| "bottom" \| "top" \| "top-end" \| "top-start" \| "bottom-end" \| "bottom-start" \| "left-start" \| "left-end" \| "right-start" \| "right-end"` | `top` | Tooltip 方位(withTooltip 时生效)。默认 top。 |
| `aria-label` | `string` | — | 自定义 aria-label;未传则随状态用 i18n「复制 / 已复制」。 |
| `...props` | `ComponentPropsWithoutRef<'button'>` | — | 透传原生 button 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onCopy` | `(value: string) => void` | 复制成功回调。<br>· `value` — 实际写入剪贴板的文本(即本组件的 value)。 |
| `onError` | `(error: Error) => void` | 复制失败回调(剪贴板不可用 / 被拒绝 / execCommand 兜底也失败)。<br>· `error` — 失败原因;特性不可用时为内置 Error,异常路径透传原始错误。 |

此外透传原生 `<button>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `copy` `clipboard` `button` `action` `feedback` `tooltip` |

::: details 需求原文 / 设计意图
高频「一键复制」场景(token / 命令 / 分享链接)需要一个开箱即用的复制按钮:点击即写剪贴板,并给出明确的即时反馈,避免用户不确定是否复制成功。设计意图——复制成功后图标从复制图标切到对勾、可选 Tooltip 提示「已复制」,timeout(默认 1500ms)后自动还原成「复制」;复用 Button 的 tone/size/variant 与 Tooltip,不另起一套样式。剪贴板写入做特性检测降级:优先 navigator.clipboard.writeText(需安全上下文),回退 document.execCommand('copy')。a11y 要求 aria-label 随状态切换,并经 aria-live=polite 视隐区播报「已复制」让读屏用户感知。留口:render-prop children (copied)=&gt;ReactNode、icon/copiedIcon 覆盖图标、onClick 经 composeEventHandlers 合并(可 preventDefault 阻断复制)。
:::
