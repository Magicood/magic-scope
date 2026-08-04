# Textarea <Badge type="tip" text="stable" /> <Badge type="info" text="v0.2.0" />

多行文本输入框,三档尺寸 + 校验失败态,透传原生 textarea。

> **[在展示站中打开 Textarea](https://magicood.github.io/magic-scope/#/textarea)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-&#42; 变量。

样式与 Input 一致:surface 底 + border,focus-visible 染 primary 并起发光环(受顶栏「光影」开关控制),invalid 染 danger 并设 aria-invalid,disabled 半透明。仅允许垂直拖拽改高(resize: vertical),尊重 reduced-motion。透传原生 textarea 属性(value / onChange / rows / placeholder / maxLength 等)。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/textarea.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸。默认 md。(影响 font-size 与 min-block-size,min-block-size 随密度缩放) |
| `invalid` | `boolean` | `false` | 校验失败态:染 danger 色并设 aria-invalid。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 聚焦发光环色调;invalid 时强制 danger。默认 primary。 |
| `showCount` | `boolean` | `false` | 显示字数(配合 maxLength 显示 当前/上限;超限染 danger)。 |
| `autosize` | `boolean \| AutosizeRange` | `false` | 随内容自动调整高度。`true` 自由增长;对象可限制 `{ minRows, maxRows }`。<br>默认 false(保留 resize: vertical 手动拖拽)。 |
| `footer` | `ReactNode` | — | 底部追加内容(渲染在 count 同一行的起始侧,如帮助文字 / 工具按钮)。 |
| `className` | `string` | — | 根容器 className。 |
| `classNames` | `TextareaClassNames` | — | 各关键子部件 className(细粒度留口)。 |
| `...props` | `ComponentPropsWithoutRef<'textarea'>` | — | 透传原生 textarea 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onPressEnter` | `(event: KeyboardEvent<HTMLTextAreaElement>) => void` | 按下裸 Enter(无修饰键、非 IME 组合中)时触发。常用于聊天/评论框发送。<br>· `event` — 触发的键盘事件。 |
| `onSubmitShortcut` | `(event: KeyboardEvent<HTMLTextAreaElement>) => void` | 按下 Cmd/Ctrl + Enter 时触发。常用于「多行框里也能快捷提交」。<br>· `event` — 触发的键盘事件。 |

此外透传原生 `<textarea>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-24 |
| 标签 | `textarea` `form` `input` `multiline` `field` `validation` `autosize` `char-count` `tone` `glow` `submit-shortcut` |

::: details 需求原文 / 设计意图
多行文本输入框,从最小版补强到生产级深度,对标旗舰 Button/Input/Text。支持 sm/md/lg 尺寸(随 --ms-density-scale 缩放)、tone 色调发光环(读 --ms-c/--ms-c-glow 槽位,invalid 强制 danger)、showCount 字数计数(配合 maxLength,超限染 danger)、autosize 自动调高(布尔或 {minRows,maxRows})、footer 底部槽、onPressEnter/onSubmitShortcut 提交快捷键(IME 安全)、classNames 细粒度留口。内部 onChange/onKeyDown 用 composeEventHandlers 合并用户处理器,...rest 透传所有原生属性与事件。magic-scope 通用基础组件:自研、消费 tokens 的 --ms-&#42; 变量,完整状态与过渡、发光,尊重 prefers-reduced-motion 与 data-ms-motion/data-ms-fx 关断。autosize 与键盘判定逻辑抽成框架无关纯函数(logic.ts),便于平移 core。
:::
