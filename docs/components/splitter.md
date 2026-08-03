# Splitter <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

可拖拽分栏布局,拖中缝实时调占比,夹 min/max 且总和守恒,键盘可达、可折叠。

> **[在展示站中打开 Splitter](https://magicood.github.io/magic-scope/#/splitter)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖的可拖拽分栏原语,消费 @magic-scope/tokens 的 --ms-* 变量。复合 Splitter + Splitter.Panel:容器负责测量主轴(ResizeObserver 跟随)并以 inline flex-basis 统一注入各面板像素尺寸,面板只承载 min/max/defaultSize/collapsible 元数据。

面板间自动渲染可拖拽 gutter——pointer 拖拽把 delta 分摊两侧、夹 min/max 且总和守恒(纯算法抽进 logic.ts 以便平移多框架);支持水平/垂直朝向,min/max 可像素或百分比混写。

受控(sizes + onResize 回写)与非受控双通道并存;区分高频 onResize 与落定 onResizeEnd;gutter 带 role="separator" + aria-orientation + aria-valuenow 无障碍语义,方向键 ←→/↑↓ 步进、Home/End 推到极限、双击折叠相邻可折叠面板。

命令式句柄 SplitterHandle 暴露 collapse / expand / getSizes;拖拽中关闭过渡跟手,折叠这类离散跳变才走过渡且尊重 prefers-reduced-motion 与 data-ms-motion="off"。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `splitter` `split-pane` `resizable` `panel` `layout` `drag` `gutter` `collapsible` |

::: details 需求原文 / 设计意图
需要一个可把容器分成多块、用户能拖拽中缝实时调整各块占比的布局原语,用于代码编辑器/文件管理器/仪表盘这类双栏或多栏界面。拖拽数值语义(delta 分摊两侧、夹 min/max、总和守恒)必须抽成框架无关纯函数 logic.ts 以便平移 core;尺寸约束允许像素或百分比混写;支持受控(外部托管 sizes)与非受控;面板可设折叠;分隔条要可键盘操作并带 separator 无障碍语义。拖拽跟手不卡顿(拖拽中关闭过渡),折叠这类离散跳变才走过渡且尊重 reduced-motion / motion=off。
:::
