# Radio <Badge type="tip" text="stable" /> <Badge type="info" text="v0.0.0" />

单选组,基于原生 input&#91;type=radio],方向键导航与 roving tabindex 开箱即用。

> **[在展示站中打开 Radio](https://magicood.github.io/magic-scope/#/radio)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

compose 了 RadioGroup(role="radiogroup")+ Radio(原生 input&#91;type=radio])两件。

RadioGroup 用 context 把 name / 选中值 / 尺寸 / 禁用下发给组内 Radio,支持受控(value)与非受控(defaultValue);同 name 自动获得原生方向键导航与 roving tabindex。

完整覆盖 hover / focus-visible(发光环)/ checked / disabled 状态,触控热区达标并尊重 reduced-motion。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/radio.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` * | `string` | — | 该选项的值,在 RadioGroup 内唯一。 |
| `children` | `ReactNode` | — | 选项右侧的文字标签内容。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸;默认继承所在 RadioGroup,缺省 md。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 语义色调;默认继承所在 RadioGroup,缺省 primary。 |
| `appearance` | `"card" \| "control"` | `control` | 外观;默认继承所在 RadioGroup,缺省 control。 |
| `labelClassName` | `string` | — | 根 label 的额外类名(同 className,语义化别名)。 |
| `controlClassName` | `string` | — | 视觉圆点控件的类名留口。 |
| `defaultValue` | `string` | — | 非受控初始选中值。 |
| `name` | `string` | — | 同组 radio 的 name;省略时自动生成,保证「同名即单选」的原生语义。 |
| `disabled` | `boolean` | — | 整组禁用。 |
| `orientation` | `"horizontal" \| "vertical"` | `vertical` | 排布方向,同时映射到 aria-orientation。默认 vertical。 |
| `options` | `RadioOption[]` | — | 数据驱动:用 options 数组渲染选项,与 children 二选一(同时传则 options 优先,children 追加在后)。<br>label 缺省回退到 value。 |
| `...props` | `ComponentPropsWithoutRef<'input'>` | — | 透传原生 input 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onValueChange` | `(value: string, event: ChangeEvent<HTMLInputElement, Element>) => void` | 选中变化回调(旧的「只取 value」调用方完全兼容)。<br>· `value` — 被选中项的 value。<br>· `event` — 触发本次选中的原生 change 事件(来自被选 Radio 的 input)。 |

此外透传原生 `<input>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-25 |
| 标签 | `radio` `radio-group` `form` `selection` `single-select` `input` `tone` `card` `options` `density` `controlled` |

::: details 需求原文 / 设计意图
补齐表单控件缺口:库内已有 Checkbox/Switch 却无单选(Radio)。原创实现,与 Checkbox 视觉语言一致(圆点 vs 方块对勾),延续设备适配契约(--ms-target-min 触控热区、hover 守卫、focus-visible 发光环、reduced-motion)。RadioGroup + Radio 双导出,基于原生 input&#91;type=radio] 以白嫖原生键盘单选语义。
:::
