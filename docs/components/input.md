# Input <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

文本输入框,三档尺寸,带聚焦发光与校验失败态。

> **[在展示站中打开 Input](https://magicood.github.io/magic-scope/#/input)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

完整覆盖 hover / focus-visible(发光) / disabled / invalid 状态与过渡;尊重 reduced-motion。invalid 会同时设 aria-invalid。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/input.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(随 data-ms-density 缩放)。默认 md。 |
| `invalid` | `boolean` | `false` | 校验失败态:染 danger 发光环并设 aria-invalid。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info"` | `primary` | 聚焦发光环色调;invalid 时强制 danger。默认 primary。 |
| `prefix` | `ReactNode` | — | 框内前置内容(图标 / 文字)。 |
| `suffix` | `ReactNode` | — | 框内后置内容。 |
| `addonBefore` | `ReactNode` | — | 框外起始拼接段(连续控件)。 |
| `addonAfter` | `ReactNode` | — | 框外末尾拼接段。 |
| `clearable` | `boolean` | `false` | 有值时显示清除按钮。 |
| `showCount` | `boolean` | `false` | 显示字数(配合 maxLength 显示 当前/上限)。 |
| `className` | `string` | — | 外层容器 className(组件根)。 |
| `inputClassName` | `string` | — | 原生 input 自身 className。 |
| `...props` | `ComponentPropsWithoutRef<'input'>` | — | 透传原生 input 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onClear` | `() => void` | 点击清除回调。 |

此外透传原生 `<input>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-24 |
| 标签 | `input` `form` `text-field` `prefix` `suffix` `addon` `clearable` `password` `count` `tone` |

::: details 需求原文 / 设计意图
magic-scope 通用库第二个组件:文本输入。自研、消费 tokens,完整 hover/focus-visible(发光)/disabled/invalid 状态,逻辑属性(RTL 友好),尊重 prefers-reduced-motion;覆盖原生 size 为尺寸枚举。
:::
