# Mark <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

文本高亮:把命中搜索词的片段包进语义化 &lt;mark&gt;,着色走 tone 槽位。

> **[在展示站中打开 Mark](https://magicood.github.io/magic-scope/#/mark)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,把「在纯文本里按搜索词找命中片段」拆成可独立单测、可跨框架复用的纯函数(logic.ts):多词各自全局匹配后做区间并集与重叠合并,绝不产生嵌套包裹;搜索词里的正则元字符按字面量转义处理,用户输入 . &#42; ( ) 等也不报错。

命中片段用原生 &lt;mark&gt; 元素保证无障碍语义(辅助技术识别为「高亮 / 相关」文本),覆盖 UA 默认黄底黑字、改走全库 tone 槽位(--ms-c / --ms-c-glow)随主题换肤联动。支持区分大小写、整词匹配;空搜索词与超长无空格串都安全降级、不撑破布局;多态 as 容器与 classNames(root / hit)细粒度槽位留口。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | 被高亮的纯文本(本组件按字符串切分,非字符串 children 不做处理直接渲染)。 |
| `search` | `string \| string[]` | — | 搜索词:单个词或多个词。空串 / 空数组 → 原样返回(不高亮)。 |
| `caseSensitive` | `boolean` | — | 区分大小写(默认 false:不区分)。 |
| `wholeWord` | `boolean` | — | 整词匹配:命中片段两侧须为单词边界(默认 false)。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `warning` | 高亮色调(复用全库 tone 槽位 --ms-c / --ms-c-glow)。默认 warning。 |
| `as` | `ElementType` | — | 多态容器标签(默认 span)。 |
| `className` | `string` | — | 容器额外类名(等价 classNames.root 的便捷写法,二者都会拼上)。 |
| `style` | `CSSProperties` | — | 容器内联样式。 |
| `classNames` | `MarkClassNames` | — | 细粒度类名槽位。 |
| `id` | `string` | — | id 透传到容器。 |
| `...props` | `ComponentPropsWithoutRef<'span'>` | — | 透传原生 span 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<span>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `mark` `highlight` `search` `keyword` `typography` `text` |

::: details 需求原文 / 设计意图
搜索结果 / 文档检索场景需要把命中关键词高亮出来。要求:命中规则(多词、是否区分大小写、是否整词)做成纯函数可独立测试与跨框架复用;搜索词里的正则元字符按字面量处理不报错;多词命中区间重叠时合并、不产生嵌套包裹;高亮用原生 &lt;mark&gt; 保证无障碍语义;着色复用全库 tone 槽位以随主题换肤联动;空搜索词与超长内容都要安全降级不撑破布局。
:::
