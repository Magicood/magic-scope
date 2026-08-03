# Result <Badge type="tip" text="stable" /> <Badge type="info" text="v0.0.0" />

结果页,七态(成功 / 失败 / 信息 / 警告 + 404 / 403 / 500)派生默认图标与配色,四槽位。

> **[在展示站中打开 Result](https://magicood.github.io/magic-scope/#/result)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。

status 七态派生默认图标与 tone 柔底发光圆,HTTP 异常另给默认标题;tone 可显式覆盖配色,size 随 data-ms-density 缩放。title / subtitle / extra / children 四槽位各带细粒度 classNames;icon 传 ReactNode 覆盖、传 false 关闭整区;多态 as 改根标签、asChild 合并到子元素。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `status` | `"success" \| "warning" \| "info" \| "error" \| "404" \| "403" \| "500"` | `info` | 结果状态:语义结果(success / error / info / warning)+ HTTP 异常(404 / 403 / 500)。<br>决定默认图标、默认 tone 配色,HTTP 异常另给默认标题。默认 info。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info"` | — | 语义色调,覆盖 status 派生的默认 tone。经全库统一 tone resolver 派生配色(只读 6 槽位)。<br>不传时按 status 自动联动(success→success、error→danger、404→info …)。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(随 data-ms-density 缩放)。默认 md。 |
| `icon` | `ReactNode` | — | 图标:不传按 status 给默认图标/数字码;传 ReactNode 覆盖(可放 SVG);传 false 关闭整个图标区。 |
| `title` | `ReactNode` | — | 主标题。HTTP 异常不传时给默认标题(如 404→“页面不存在”)。 |
| `subtitle` | `ReactNode` | — | 副标题(标题下方的说明文字)。 |
| `extra` | `ReactNode` | — | 操作区:返回 / 重试等按钮,渲染在内容最下方。 |
| `classNames` | `ResultClassNames` | — | 各部件细粒度 className。 |
| `as` | `ElementType` | — | 多态:改变根元素标签(如 'section' / 'main')。默认 'div'。与 asChild 互斥。 |
| `asChild` | `boolean` | `false` | 渲染为子元素(把样式 / props 合并到子元素,Radix Slot 风格;由子元素自带内容)。<br>与子部件槽位互斥(此模式下不渲染内部图标/标题等结构)。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `result` `结果页` `feedback` `反馈` `status` `状态` `404` `403` `500` `success` `error` `empty-state` `tone` `icon` |

::: details 需求原文 / 设计意图
结果页组件,对标 AntD Result。status: success/error/info/warning/404/403/500;按 status 给默认图标(可自定义 icon)与配色(tone 联动,success→success 等);title?/subtitle?: ReactNode;extra?: ReactNode(操作区,如返回/重试按钮);children(补充内容)。图标用大号字符/SVG + tone 柔底圆。size。多态 as。需遵守 magic-scope 旗舰标准(tone 槽位、动效双降级、strict TS、留口、纯逻辑下沉 logic.ts)。
:::
