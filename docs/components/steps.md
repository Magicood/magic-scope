# Steps <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

步骤条 / 向导,线性流程指引,逐步派生 wait/process/finish/error 状态。

> **[在展示站中打开 Steps](https://magicood.github.io/magic-scope/#/steps)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。

current 受控/非受控双通道 + onChange(提供后各可用步可点击、键盘 ←→/↑↓/Home/End/Enter/Space 可达);支持 horizontal/vertical 方向、sm/default 尺寸、progressDot 点状、labelPlacement 标题位、percent 当前步进度环。

每步圆点按状态着 tone 色(finish/process 主色、error danger、wait neutral),连线随流程染色;状态机集中在零 React 的 logic.ts,可平移多框架。数据入口双通道:items 数组 或 复合子组件 &lt;Steps.Step /&gt;。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `StepItem[]` | — | 步骤数据数组(也可改用复合子组件 Steps.Step,二选一)。 |
| `current` | `number` | — | 当前步索引(受控)。从 0 开始。 |
| `defaultCurrent` | `number` | — | 默认当前步索引(非受控)。默认 0。 |
| `status` | `"wait" \| "error" \| "process" \| "finish"` | — | 当前步整体状态:wait / process / finish / error。默认 process。 |
| `direction` | `"horizontal" \| "vertical"` | — | 方向。默认 horizontal。 |
| `size` | `"sm" \| "default"` | — | 尺寸:紧凑 sm / 默认。默认 default。 |
| `progressDot` | `boolean` | — | 点状步骤(以小圆点替代序号圆圈,更轻量)。 |
| `labelPlacement` | `"horizontal" \| "vertical"` | — | 标题相对圆点的位置(仅 horizontal 生效)。默认 horizontal。 |
| `percent` | `number` | — | 当前步进度环百分比(0-100);配合 status="process" 在当前圆点上画环。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | — | 语义色调,派生主色档(finish/process 圆点与连线)。默认 primary。 |
| `classNames` | `StepsClassNames` | — | 部件级 className。 |
| `children` | `ReactNode` | — | 复合子组件入口(&lt;Steps.Step /&gt;);与 items 二选一。 |
| `className` | `string` | — | 透传到该步根节点的类名。 |
| `title` | `ReactNode` | — | 主标题。 |
| `description` | `ReactNode` | — | 副描述(标题下方弱化文本)。 |
| `icon` | `ReactNode` | — | 自定义圆点 / 图标内容(覆盖默认序号 / 状态图标)。 |
| `key` | `string \| number` | — | 该步的无障碍 key(列表渲染优化用,默认用 index)。 |
| `disabled` | `boolean` | — | 是否禁用(不可点击跳步)。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onChange` | `(current: number) => void` | 点击某步跳转(提供后各可用步可点击 / 键盘可达)。<br>· `current` — 被跳转到的步骤索引(从 0 开始)。 |

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `steps` `stepper` `wizard` `progress` `navigation` `process` `guide` `vertical` `horizontal` |

::: details 需求原文 / 设计意图
步骤条(向导,对标 AntD Steps)。items: {title,description?,icon?,status?,disabled?}&#91;] 或复合 Steps.Step;current(受控)+ onChange(可点击跳步)、status(当前步 wait/process/finish/error)、direction(horizontal 默认 \| vertical)、size(sm/default)、progressDot(点状)、labelPlacement(horizontal/vertical)、percent(当前步进度环)。每步圆点/图标按 status 着 tone 色(finish→primary、error→danger、process→primary 高亮),连线 finish 染色。键盘可达(可点击时)。logic.ts 放步态解析。
:::
