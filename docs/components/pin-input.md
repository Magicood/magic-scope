# PinInput <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

OTP/验证码分段输入,逐格单字符、自动跳格、整串粘贴自动分填,受控/非受控两用。

> **[在展示站中打开 PinInput](https://magicood.github.io/magic-scope/#/pin-input)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖:字符过滤与「串↔定长格数组」互转抽成零 React 纯函数(logic.ts,可平移多框架),组件只把它们接进状态 / DOM / 键盘。

length 个单字符格——合法字符即时跳下一格、Backspace 在空格回退并清前一格、粘贴整串自动分填、←→/Home/End 焦点导航;type 限定收字范围(numeric / alphanumeric),mask 掩码敏感口令,invalid 染 danger 发光环,填满触发 onComplete 上升沿。

a11y:外层 role=group + i18n aria-label,每格独立「第 N 位」aria-label 与 aria-invalid,键盘完全可达;尺寸随 data-ms-density 缩放,触控热区抬到 --ms-target-min,动效在 prefers-reduced-motion 与 data-ms-motion=off 下降级。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `length` | `number` | `6` | 分段格数。默认 6。 |
| `value` | `string` | — | 受控值(整串;长于 length 截断,短于 length 右侧留空)。 |
| `defaultValue` | `string` | — | 非受控初始值。 |
| `type` | `"numeric" \| "alphanumeric"` | `numeric` | 收字范围:numeric 仅数字 / alphanumeric 数字+字母。默认 numeric。 |
| `mask` | `boolean` | `false` | 掩码显示(密码点),适合敏感口令。 |
| `disabled` | `boolean` | `false` | 禁用全部格子。 |
| `invalid` | `boolean` | `false` | 校验失败态:染 danger 发光环并设 aria-invalid。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(随 data-ms-density 缩放)。默认 md。 |
| `autoFocus` | `boolean` | `false` | 挂载即聚焦首格。 |
| `placeholder` | `string` | — | 单字符占位符,逐格显示。 |
| `aria-label` | `string` | — | 整组可访问名;默认走 i18n 的 pinInput.label。 |
| `classNames` | `PinInputClassNames` | — | 子部件类名留口(root / cell)。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onChange` | `(value: string) => void` | 值变化回调,回传当前整串(已按 type 清洗)。<br>· `value` — 当前已输入的紧凑整串(去掉空位、按 type 清洗后的结果);未填满时长度小于 length。 |
| `onComplete` | `(value: string) => void` | 填满全部格子时回调一次,回传完整串。<br>· `value` — 填满 length 个格子时的完整整串(已按 type 清洗);仅在「上次未满→本次满」上升沿触发一次。 |

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `pin` `otp` `verification-code` `segmented` `form` `a11y` |

::: details 需求原文 / 设计意图
验证码/一次性口令场景的分段输入:length 个单字符格,合法字符即时跳下一格、Backspace 在空格回退并清前一格、粘贴整串自动分填到各格、←→/Home/End 焦点导航;type 限定收字范围(numeric 仅数字 / alphanumeric),mask 掩码敏感口令,invalid 染 danger 发光环;填满触发 onComplete。硬约束:字符过滤/串↔格数组互转必须是零 React 纯函数(logic.ts,可平移 core)且各端复用同一语义;a11y 必达——外层 role=group + i18n aria-label,每格独立 aria-label(第 N 位)与 aria-invalid,键盘完全可达;尺寸随 data-ms-density 缩放、触控热区抬到 --ms-target-min,动效在 prefers-reduced-motion 与 data-ms-motion=off 下降级。
:::
