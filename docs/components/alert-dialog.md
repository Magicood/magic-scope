# AlertDialog <Badge type="tip" text="stable" /> <Badge type="info" text="v0.0.0" />

命令式 confirm / alert / prompt,await 一行拿到用户决策,无需自管 open 状态。

> **[在展示站中打开 AlertDialog](https://magicood.github.io/magic-scope/#/alert-dialog)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

基于原生 &lt;dialog&gt; + showModal()(焦点陷阱、Esc、top-layer),portal 到 body 并锁背景滚动。

confirm() 返回 Promise&lt;boolean&gt;、alert() 返回 Promise&lt;void&gt;、prompt() 返回 Promise&lt;string \| null&gt;,可直接 await。

danger 变体会把确认按钮染危险色、默认焦点落在取消以防误触销毁性操作;prompt 默认焦点落在输入框并全选。

模块级队列驱动,任意处直接调用即可——只需在应用根挂载一次 &lt;AlertDialogHost /&gt;(本展示站已全局挂载)。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/alert-dialog.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | `ReactNode` | — | 标题(可选)。 |
| `confirmText` | `ReactNode` | — | 确认按钮文案。默认走 i18n alertDialog.confirm。 |
| `cancelText` | `ReactNode` | — | 取消按钮文案。默认走 i18n alertDialog.cancel。 |
| `variant` | `AlertDialogTone` | — | 语义色调。danger 时确认按钮染危险色、默认焦点落在取消(防误触销毁性操作)。<br>扩成完整 tone(default/danger/warning/success/info),面板挂 ms-tone-*。 |
| `icon` | `ReactNode` | — | 警示图标槽位(ReactNode),渲染在标题/消息起始处,危险弹窗常用。 |
| `confirmLoading` | `boolean` | — | 受控 loading:为 true 时确认按钮 loading + 禁用(异步 onConfirm 期间内部也会自动置位)。 |
| `placeholder` | `string` | — | 输入框占位符。 |
| `defaultValue` | `string` | — | 输入框初始值。 |
| `inputType` | `PromptInputType` | — | 输入类型:text(默认)/ password / number,平移到原生 &lt;input&gt; type。 |
| `validate` | `(value: string) => string \| undefined` | — | 校验函数:返回非空字符串视为「无效」——拦截确认并把返回串作为错误提示展示,<br>同时禁用确认按钮;返回 undefined / 空串视为「有效」。实时随输入运行。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onConfirm` | `() => void \| Promise<void>` | 点击确认时触发(与 Promise 双轨;不 await 也能挂回调)。返回 Promise 时进入异步态:<br>确认按钮 loading + 禁用,resolve 才关闭,reject 保持打开便于重试。<br>· `value` — 确认时输入框的当前值(已通过校验)。 |
| `onCancel` | `() => void` | 点取消时触发(主动取消语义,区别于 Esc / 点外关闭)。 |
| `onEscapeKeyDown` | `(event: Event) => void` | 按 Esc 关闭前触发;可拦截(危险操作禁 Esc 关闭)。<br>· `event` — 触发关闭的原生事件(Esc),在其上调用 preventDefault 可拦截默认关闭。 |
| `onPointerDownOutside` | `(event: MouseEvent) => void` | 点击遮罩(面板外)关闭前触发;可拦截(危险操作禁点外关)。<br>· `event` — 遮罩上按下的原生鼠标事件,在其上调用 preventDefault 可拦截关闭。 |
| `onValueChange` | `(value: string) => void` | 输入值实时变化时触发(即时拿到当前值,可外部联动)。<br>· `value` — 输入框当前的实时值(变化后的字符串)。 |

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-25 |
| 标签 | `alert-dialog` `confirm` `alert` `prompt` `dialog` `imperative` `feedback` `tone` `i18n` `async-confirm` `validate` `loading` |

::: details 需求原文 / 设计意图
补齐弹窗提示:命令式确认/提示框。原创实现,与 Toast 同构(模块级队列 + useSyncExternalStore + host),但叠加 Promise 解析(await confirm())。基于原生 &lt;dialog&gt; showModal 白嫖焦点陷阱/Esc/top-layer;复用 ms-button 类保证按钮一致。涵盖 role=alertdialog 语义、danger 默认焦点防误触、安全区/窄屏纵向动作/reduced-motion。区别于已有的通用模态 Dialog(声明式容器)。
:::
