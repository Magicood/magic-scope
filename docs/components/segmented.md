# Segmented <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

分段选择控件,单选 toggle,滑块 indicator 平滑跨段,接全库 tone。

> **[在展示站中打开 Segmented](https://magicood.github.io/magic-scope/#/segmented)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-&#42; 变量。

紧凑的 tab / radio 替代:单个滑块 indicator 平滑跨段位移(过渡受 motion 双降级);数据入口为 options 数组或复合 &lt;Segmented.Item&gt;,label 支持 ReactNode + icon。

受控 value/defaultValue + onChange/onValueChange 双通道;方向键 / Home / End 导航(跳过禁用、环形)+ Enter/Space 选中,roving tabindex;role 可选 radiogroup(默认)或 tablist。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `options` | `readonly (string \| number \| SegmentedOption)[]` | — | 选项:对象数组(label 可 ReactNode / icon / disabled),或纯值简写 &#91;'a','b']。与 children 二选一。 |
| `children` | `ReactNode` | — | 复合子节点用法:&lt;Segmented.Item value="a"&gt;…&lt;/Segmented.Item&gt;。与 options 二选一。 |
| `value` | `string` | — | 当前选中值(受控)。 |
| `defaultValue` | `string` | — | 默认选中值(非受控)。省略时默认首个可用项。 |
| `size` | `"sm" \| "md" \| "lg"` | — | 尺寸(随 data-ms-density 缩放)。默认 md。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info"` | — | 语义色调,派生选中底色 / 发光。默认 primary。 |
| `orientation` | `"horizontal" \| "vertical"` | — | 朝向:横向或纵向堆叠。默认 horizontal。 |
| `block` | `boolean` | — | 块级铺满容器、各段等分。 |
| `fullWidth` | `boolean` | — | block 的别名(对齐 Button.fullWidth 命名习惯)。 |
| `disabled` | `boolean` | — | 禁用整个控件。 |
| `role` | `"radiogroup" \| "tablist"` | — | 无障碍语义:单选组(默认)或选项卡。 |
| `classNames` | `SegmentedClassNames` | — | 部件级 className。 |
| `renderItem` | `((item: SegmentedOption, state: { selected: boolean; index: number; }) => ReactNode)` | — | 自定义渲染段内容(覆盖默认 icon+label 布局)。 |
| `aria-label` | `string` | — | 无可见 label 时的无障碍名称。 |
| `aria-labelledby` | `string` | — | 关联可见 label 的 id。 |
| `icon` | `ReactNode` | — | 段前置图标。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onChange` | `(value: string, item: SegmentedOption) => void` | 选中变化。<br>· `value` — 选中后的新值。<br>· `item` — 选中项对应的完整 SegmentedOption(含 label / icon / disabled 等)。 |
| `onValueChange` | `(value: string) => void` | 选中变化(仅 value)双通道之一,便于受控简写。<br>· `value` — 选中后的新值。 |

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `segmented` `segmented-control` `tabs` `radio-group` `toggle` `switch` `selection` `indicator` `keyboard` `accessible` `controlled` |

::: details 需求原文 / 设计意图
对标 AntD Segmented 的生产级分段控制器:紧凑的 tab/radio 替代。需求:options({label,value,icon?,disabled?}&#91;],label 可 ReactNode)或 children 复合用法;受控 value/defaultValue + onChange(value);单个滑块 indicator 平滑跨段位移(测选中段 offset 写 CSS 变量,过渡受 motion 降级);size(sm/md/lg 随密度)、tone(6 语义色)、block/fullWidth(等分)、纵向、disabled;键盘 ArrowLeft/Right/Home/End 导航 + Enter/Space;role=radiogroup/radio 或 tablist/tab;classNames 部件定制;选中解析 / 键盘 step 纯逻辑下沉 logic.ts。接全库 tone 槽位 + 密度 + 动效双降级 + i18n。
:::
