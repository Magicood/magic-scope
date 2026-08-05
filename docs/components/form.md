# Form <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

表单子系统 + 零依赖校验引擎,订阅式切片 store 让打字只重渲单字段。

> **[在展示站中打开 Form](https://magicood.github.io/magic-scope/#/form)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、headless 引擎落在纯 TS(零 React,为将来抽 @magic-scope/core 留口):字段值与校验态进订阅式切片 store,大表单打字时表单根与兄弟字段零 re-render(细粒度 path 切片 + useSyncExternalStore)。

校验双轨可叠加——内建 rules(零依赖、可 i18n)+ Standard Schema v1(不 import zod,zod/valibot/arktype 原生兼容);异步校验自带防抖与竞态取消。

用显式适配器表把库内 10 个 value/onChange 形态不一的控件(Checkbox 用 checked、Slider/Rate 用数值、Select ref→button…)优雅注入,Field 自动连好 a11y(label↔control、aria-invalid/describedby/required、提交聚焦首错),校验失败态复用全库 tone 发光、错误文案 role=alert 滑入不抖布局。

配合 useForm(命令式 FieldPath 类型安全)与 Form.Field/Submit/Reset/List/ErrorSummary 子部件使用。

Form.List 取 name(数组字段路径)+ render-prop children(api),api 给出稳定 id 的 fields 列表与 append / remove / move;与 Form.Field 的同名参数含义不同,下表按 Field 口径列出。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `form` * | `FormApi<T>` | — | 由 useForm 建出的 api(必传,提供 store 与提交逻辑)。 |
| `layout` | `"inline" \| "horizontal" \| "vertical"` | `vertical` | 布局:vertical(默认)/ horizontal / inline。 |
| `labelWidth` | `string \| number` | — | horizontal 布局下 label 列宽(如 '8rem' / 120)。 |
| `labelAlign` | `"end" \| "start"` | `start` | label 对齐(horizontal 布局)。默认 start。 |
| `disabled` | `boolean` | `false` | 整表禁用(下发到各 Field 控件)。 |
| `classNames` | `FormClassNames` | — | 各部件细粒度 className(下发到所有 Field)。 |
| `as` | `ElementType` | — | 多态根标签(默认 'form')。与 asChild 互斥。 |
| `asChild` | `boolean` | `false` | 渲染为子元素(Radix Slot;把 form 行为合并到子)。 |
| `ref` | `Ref<HTMLFormElement>` | — |  |
| `name` | `string` | — | Form.Field:字段路径(支持 a.b / items.0.x;类型安全的命令式 API 见 useForm 返回值)。 |
| `label` | `ReactNode` | — | Form.Field:标签。 |
| `rule` | `Rule<unknown, Record<string, unknown>>` | — | Form.Field:字段级规则(与 Form/useForm 的 rules、schema 可叠加)。 |
| `required` | `boolean` | — | Form.Field:是否必填(落 Label 标记 + aria-required;Standard Schema 无法跨厂商内省,故以显式为准)。不传时从 `rule.required` 派生。 |
| `help` | `ReactNode` | — | Form.Field:帮助文字(控件下方,aria-describedby 关联)。 |
| `control` | `"input" \| "select" \| "textarea" \| "switch" \| "radioGroup" \| "checkbox" \| "slider" \| "numberInput" \| "checkboxGroup" \| "rate" \| "segmented"` | — | Form.Field:显式指定控件适配器种类(异形 / 包了一层的控件用)。 |
| `className` | `string` | — | Form.Field:根项 className。 |
| `children` | `ReactNode \| ((field: FieldRenderProps, state: FieldState) => ReactNode)` | — | Form.Field:子节点 —— 登记控件直接子(`<Form.Field><Input/></Form.Field>`,自动注入 value/onChange/a11y)<br>或 render-prop(`<Form.Field>{(field, state) => …}</Form.Field>`,首选、对自定义控件最友好)。 |
| `loading` | `boolean` | — | Form.Submit:强制 loading 态。不传时随表单 `isSubmitting` 自动置位(提交中转圈并禁用)。 |
| `title` | `ReactNode` | — | Form.ErrorSummary:标题(不传用 i18n 默认「表单有 N 处错误」)。 |
| `...props` | `ComponentPropsWithoutRef<'form'>` | — | 透传原生 form 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onSubmit` | `(values: T) => void \| Promise<void>` | 校验全过的提交回调。<br>· `values` — 通过校验的整表值(类型化;若挂 schema 则为其 Output) |
| `onInvalid` | `(errors: Record<string, { message: string; }>) => void` | 校验未过的回调。<br>· `errors` — 各字段错误表(path → { message }),提交时聚焦首个错误字段 |
| `onClick` | `MouseEventHandler<HTMLButtonElement>` | Form.Reset:点击回调。先于重置执行,调 `preventDefault()` 可拦下这次重置。 |

此外透传原生 `<form>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `form` `validation` `schema` `field` `headless` `standard-schema` `composite` |

::: details 需求原文 / 设计意图
做一套对标 react-hook-form DX + antd Form 声明式 + 类型安全三者之长的表单子系统。硬约束:① 校验引擎与字段 store 必须零 React、纯 TS(进 logic.ts),为将来抽 @magic-scope/core 留口;② 大表单打字时表单根与兄弟字段零 re-render(细粒度 path 切片订阅 + useSyncExternalStore);③ 校验双轨可叠加——内建 rules(零依赖、可 i18n)+ Standard Schema v1(不 import zod、零运行时依赖,zod/valibot/arktype 原生兼容);④ 必须优雅注入库内 10 个 value/onChange 形态不统一的现有控件(Checkbox 用 checked、Slider/Rate 用数值、Select ref→button…),用显式适配器表而非 cloneElement 反射;⑤ 异步校验自带 AbortController 竞态取消 + 防抖;⑥ a11y 连线(label↔control、aria-invalid/describedby/required、提交聚焦首错);⑦ 校验态复用全库 tone resolver 发光 + 错误文案 role=alert 滑入不抖布局,作为「魔法」差异化。诚实取舍:Standard Schema v1 无跨厂商字段级 optionality 内省,故必填以显式 required 为准、不假装从 schema 自动推断;JSX 上 Field name 暂为 string,FieldPath 类型安全落在命令式 api(setValue/watch/trigger)。
:::
