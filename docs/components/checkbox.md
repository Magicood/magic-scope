# Checkbox <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

复选框,基于原生 input&#91;type=checkbox],checked 染主色画对勾、支持半选态。

> **[在展示站中打开 Checkbox](https://magicood.github.io/magic-scope/#/checkbox)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-&#42; 变量。

label 包视觉隐藏的原生 input + 视觉方块(checked 画对勾、indeterminate 画横杠)+ 可选文字,可访问性与键盘可达性来自原生。

完整覆盖 hover / focus-visible(发光环) / checked / indeterminate / disabled 状态与过渡;coarse 指针下用隐形 ::before 把命中区扩到 --ms-target-min;尊重 reduced-motion。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/checkbox.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | 复选框右侧的文字标签内容。 |
| `description` | `ReactNode` | — | 标签下方的次级说明(fg-muted),用于补充语境。 |
| `indeterminate` | `boolean` | `false` | 半选(部分选中)态:仅视觉,不改变 checked 取值。常用于「全选」框。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 语义色调,经全库 tone resolver 派生配色;默认继承所在 CheckboxGroup,缺省 primary。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸;默认继承所在 CheckboxGroup,缺省 md。 |
| `value` | `string` | — | 该项的值;置于 CheckboxGroup 内时用于自动判定 checked 与回传选中集合。 |
| `checked` | `boolean` | — | 受控选中态(独立使用时)。 |
| `defaultChecked` | `boolean` | — | 非受控初始选中态(独立使用时)。 |
| `disabled` | `boolean` | — | 禁用;默认继承所在 CheckboxGroup。 |
| `labelClassName` | `string` | — | 仅作用于根 label 的额外类名(与 className 叠加,className 也在根)。 |
| `inputProps` | `Omit<DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "ref">` | — | 透传给内部 input 的属性(如 name/required/form/aria-&#42;),与组件内部的 input 行为合并。 |
| `...props` | `ComponentPropsWithoutRef<'input'>` | — | 透传原生 input 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onChange` | `(event: ChangeEvent<HTMLInputElement, Element>) => void` | 原生 change 回调,透传到内部 input(与组级 onChange 并存)。<br>· `event` — 内部 input 的原生 change 事件。 |
| `onCheckedChange` | `(checked: boolean) => void` | 只关心布尔的语义回调:勾选/取消勾选时触发。<br>· `checked` — 切换后的选中态。 |

此外透传原生 `<input>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-24 |
| 标签 | `checkbox` `checkbox-group` `form` `input` `toggle` `selection` `multi-select` `indeterminate` `tone` `accessible` |

::: details 需求原文 / 设计意图
基于原生 input&#91;type=checkbox] 的复选框,选中时方块染主色并以对勾呈现,带发光聚焦环。工程要求(magic-scope 通用基础组件):自研、消费 tokens 的 --ms-&#42; 变量,完整状态与过渡、发光,尊重 prefers-reduced-motion。
:::
