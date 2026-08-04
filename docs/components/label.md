# Label <Badge type="tip" text="stable" /> <Badge type="info" text="v0.2.0" />

表单标签,基于原生 &lt;label&gt;;htmlFor 关联控件,required 时文末追加装饰星号。

> **[在展示站中打开 Label](https://magicood.github.io/magic-scope/#/label)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-&#42; 变量。

通过 htmlFor 关联原生表单控件(点击标签即聚焦对应控件),或用自身 id 配合自定义控件的 aria-labelledby 关联;required 仅在文末渲染装饰性星号(aria-hidden),真正的必填语义应由控件自身的 aria-required 承担。透传全部原生 label 属性,尊重 reduced-motion。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/label.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | 标签文字内容。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(随 data-ms-density 缩放),与表单控件三档对齐。默认 md。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `neutral` | 语义色调:根加 `ms-tone-${tone}`,文字与必填标记读 `--ms-c` / `--ms-c-glow`。<br>默认 neutral(沿用普通 fg,不染色);success / danger 可用于「校验通过 / 失败」着色。 |
| `required` | `boolean` | `false` | 必填标记:文末追加视觉标记(默认 &#42;,aria-hidden 装饰)+ 读屏可读必填语义。与 optional 互斥(required 优先)。 |
| `optional` | `boolean` | `false` | 可选标记:文末追加「可选」文字(走 i18n `label.optional`)。与 required 互斥。 |
| `requiredMark` | `ReactNode` | — | 自定义必填标记内容(替换默认 &#42;),如自定义图标 / 文案。 |
| `requiredClassName` | `string` | — | 必填标记自身 className(定制颜色 / 间距等)。 |
| `disabled` | `boolean` | `false` | 禁用态:降透明度、关闭交互态(配合受控表单的 disabled 字段)。 |
| `...props` | `ComponentPropsWithoutRef<'label'>` | — | 透传原生 label 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<label>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-24 |
| 标签 | `form` `label` `forms` `field` `required` `optional` `size` `tone` `validation` `i18n` `accessibility` `react` |

::: details 需求原文 / 设计意图
表单标签,基于原生 label,支持 htmlFor 关联控件。补强到旗舰深度:size(sm/md/lg)随 data-ms-density 缩放、tone 语义色调读 tone 6 槽位(可 success/danger 校验着色)、required 与 optional 互斥标记(可选文案走 i18n label.optional、必填读屏语义走 label.required)、requiredMark / requiredClassName 自定义必填标记、disabled 态;根 label 透传所有原生属性与事件(onClick compose 不丢用户处理器)。magic-scope 通用基础组件:自研、消费 tokens 的 --ms-&#42; 变量,完整状态与过渡、发光门控于 --ms-fx-glow,尊重 prefers-reduced-motion 与 data-ms-motion。
:::
