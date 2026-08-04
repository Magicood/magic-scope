# Rate <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

星级评分,受控/非受控双通道,支持半星、再点清零与自定义图标。

> **[在展示站中打开 Rate](https://magicood.github.io/magic-scope/#/rate)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-&#42; 变量。

受控 value / 非受控 defaultValue + onChange 双通道;allowHalf 半星(指针半区 + 键盘 0.5 步进)、allowClear 再点清零、character 自定义图标(共用或逐星 render-prop)、只读 / 禁用、hover 预览高亮、每星 tooltip、showText 评分文案。

接全库 tone 槽位派生填充与发光;根 role=slider 键盘可达(←/→/↑/↓ 加减、Home/End 极值)。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` | — | 当前评分(受控)。0..count,allowHalf 时可为 .5 步进。 |
| `defaultValue` | `number` | — | 默认评分(非受控)。 |
| `count` | `number` | — | 星数。默认 5。 |
| `allowHalf` | `boolean` | — | 允许半星(指针落在星左半区取 .5,键盘步进 0.5)。 |
| `allowClear` | `boolean` | — | 再次点击当前评分时清零。默认 true。 |
| `character` | `ReactNode \| ((state: RateCharacterRenderState) => ReactNode)` | — | 自定义图标:ReactNode(所有星共用)或 (state) =&gt; ReactNode(逐星定制)。默认五角星。 |
| `readOnly` | `boolean` | — | 只读:展示评分但不可交互(仍可聚焦读屏)。 |
| `disabled` | `boolean` | — | 禁用:不可交互、降透明度、移出 Tab 序。 |
| `size` | `"sm" \| "md" \| "lg"` | — | 尺寸(随 data-ms-density 缩放)。默认 md。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | — | 语义色调,派生填充色与发光。默认 warning(金色)。 |
| `tooltips` | `readonly string[]` | — | 每颗星的提示文案(title + aria),长度应为 count。 |
| `showText` | `boolean \| ((value: number) => ReactNode)` | — | 在星组右侧渲染评分文案;true 显示数值,或传 (value) =&gt; ReactNode 自定义。 |
| `classNames` | `RateClassNames` | — | 部件级 className。 |
| `aria-label` | `string` | — | 无障碍名称(无可见 label 时建议提供)。 |
| `aria-labelledby` | `string` | — | 关联可见 label 的 id。 |
| `className` | `string` | — | 附加根类名。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onChange` | `(value: number) => void` | 评分变化回调。<br>· `value` — 变化后的最终评分值;0..count,allowHalf 时可为 .5 步进。 |
| `onHoverChange` | `(value: number) => void` | 悬停预览值变化回调。<br>· `value` — 当前悬停预览的评分值;指针移出星组时为 -1。 |

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `rate` `rating` `评分` `star` `review` `feedback` `form` `slider` `half-star` `tone` `a11y` |

::: details 需求原文 / 设计意图
评分组件,对标 AntD Rate / MUI Rating。要求:受控 value/defaultValue + onChange(value);count(默认 5)、allowHalf(半星)、allowClear(再点清零)、character 自定义图标(默认星)、readOnly、disabled、size、tone(默认 warning 金色,读 --ms-c)、hover 预览高亮、键盘 ArrowLeft/Right 加减(配 allowHalf 步进 0.5)、tooltips 每星提示、aria(role=slider,aria-valuenow/valuetext)、onHoverChange 回调;value/hover/键盘步进纯逻辑下沉 logic.ts。
:::
